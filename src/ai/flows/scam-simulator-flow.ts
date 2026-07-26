
'use server';

/**
 * @fileOverview A safe environment to experience and learn from AI-driven scam simulations.
 * 
 * - continueSimulation - A server action to progress the scam simulation.
 * - SimulationInput - Input for the simulation.
 * - SimulationOutput - AI-generated response for the simulation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SCAM_SIMULATOR_SYSTEM_INSTRUCTION } from '@/ai/prompts/scam-templates';

const SimulationInputSchema = z.object({
  scenario: z.string().describe('The scam scenario to simulate (e.g., "Bank KYC update scam").'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});

const SimulationOutputSchema = z.object({
  message: z.string().describe('The scammer\'s next response.'),
  reasoning: z.string().describe('Short internal reasoning for the current simulation state.'),
  didVictimFallForIt: z.boolean().describe('Whether the user just gave away sensitive info or performed a risky action.'),
  educationalInsight: z.string().optional().describe('Insight provided if the user falls for it or the sim ends.'),
  isEnded: z.boolean().describe('Whether the simulation has concluded.'),
});

export type SimulationInput = z.infer<typeof SimulationInputSchema>;
export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;

/**
 * Define the simulator prompt with safety settings to allow educational role-play.
 */
const simulatorPrompt = ai.definePrompt({
  name: 'simulatorPrompt',
  input: { schema: SimulationInputSchema },
  output: { schema: SimulationOutputSchema },
  system: SCAM_SIMULATOR_SYSTEM_INSTRUCTION,
  config: {
    temperature: 0.7,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      }
    ],
  },
  prompt: `
  Scenario Context: {{{scenario}}}
  
  --- CONVERSATION HISTORY ---
  {{#if history}}
  {{#each history}}
  - {{role}}: {{content}}
  {{/each}}
  {{else}}
  (No history yet. This is the start of the simulation.)
  {{/if}}
  
  TASK:
  Continue the simulation. 
  1. If history is empty: Start the scam by introducing yourself according to the scenario.
  2. If history exists: Respond to the user's last message, applying psychological pressure (Urgency, Authority, Fear, Greed).
  3. Evaluate if the user has "fallen" for the scam (e.g., by providing an OTP, clicking a link, or agreeing to a suspicious request).
  4. End the simulation if the user is compromised or if they have clearly identified and neutralized the threat.
  
  OUTPUT INSTRUCTION:
  Return only a valid JSON object matching the schema. Do not include markdown formatting or extra text.
  `,
});

/**
 * Define the Genkit flow for the simulator.
 */
const simulatorFlow = ai.defineFlow(
  {
    name: 'simulatorFlow',
    inputSchema: SimulationInputSchema,
    outputSchema: SimulationOutputSchema,
  },
  async (input) => {
    const modelName = 'googleai/gemini-2.0-flash';
    const delays = [2000, 4000, 8000];
    let attempt = 0;
    
    while (true) {
      attempt++;
      const startTime = Date.now();
      try {
        console.log(`[ScamSimulator] Executing model ${modelName} (Attempt ${attempt}/4)`);
        const { output } = await simulatorPrompt(input);
        const executionTime = Date.now() - startTime;
        
        if (!output) {
          throw new Error('Empty response from intelligence link.');
        }
        
        console.log(`[ScamSimulator] Success in ${executionTime}ms on attempt ${attempt}`);
        return output;
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        const isRateLimit = error.message?.includes('RESOURCE_EXHAUSTED') || 
                            error.message?.includes('429') || 
                            error.status === 429 || 
                            error.code === 429;
                            
        console.error(`[ScamSimulator] Attempt ${attempt} failed in ${executionTime}ms:`, {
          exception: error.message || error,
          stack: error.stack,
          modelUsed: modelName,
          status: error.status || error.code || 'unknown',
          retryCount: attempt - 1,
        });

        if (isRateLimit && attempt <= 3) {
          const delay = delays[attempt - 1];
          console.warn(`[ScamSimulator] Rate limit detected. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If quota is exceeded, return user-friendly error string
        if (isRateLimit) {
          throw new Error('AI services are temporarily unavailable. Please try again shortly.');
        }

        throw new Error(`Forensic Link Interrupted: ${error.message || 'Unknown Error'}`);
      }
    }
  }
);

/**
 * Server action to interact with the scam simulator.
 */
export async function continueSimulation(input: SimulationInput): Promise<SimulationOutput> {
  // If Gemini API Key is missing, run in Zero-Config local interactive Mock mode
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    const { scenario, history } = input;

    // First turn: Initial message
    if (history.length === 0) {
      if (/kyc|bank|card|sbi|hdfc/i.test(scenario)) {
        return {
          message: 'SYSTEM ALERT: Your primary account has been temporarily locked due to suspicious activity. Please verify your identity immediately to prevent permanent suspension.',
          reasoning: 'Initiating bank alert script.',
          didVictimFallForIt: false,
          isEnded: false,
        };
      }
      if (/electricity|power|bill/i.test(scenario)) {
        return {
          message: 'DEAR CONSUMER: Your electricity connection will be disconnected tonight at 9:30 PM due to unpaid dues. Please contact our helpline officer immediately.',
          reasoning: 'Initiating utility cut alert script.',
          didVictimFallForIt: false,
          isEnded: false,
        };
      }
      if (/courier|customs|dhl|fedex/i.test(scenario)) {
        return {
          message: 'DHL Alert: Package #739281-IN has been held at customs. A processing fee is required. Reply with your details to release the shipment.',
          reasoning: 'Initiating customs cargo hold script.',
          didVictimFallForIt: false,
          isEnded: false,
        };
      }
      return {
        message: `Hello, I am calling regarding your recent request for "${scenario}". We need to complete a verification process. Are you ready?`,
        reasoning: 'Initiating generic confirmation prompt.',
        didVictimFallForIt: false,
        isEnded: false,
      };
    }

    // Process user's last message
    const lastUserMessage = history[history.length - 1].content.trim();

    // Check if user complied with sensitive info (e.g. sent numbers or a code)
    const hasNumbers = /\b\d{4,8}\b/.test(lastUserMessage) || /otp|code|password|pin/i.test(lastUserMessage);
    if (hasNumbers) {
      return {
        message: 'Thank you, transaction verified.',
        reasoning: 'Credentials captured, ending simulation.',
        didVictimFallForIt: true,
        isEnded: true,
        educationalInsight: '🔴 Critical Failure: You shared a passcode/OTP or security token. Scammers use artificial urgency to panic you into revealing these credentials, which are used to bypass two-factor authentication.',
      };
    }

    // Check if user called out the scam
    const isSkeptical = /scam|fake|police|report|fraud|cyber|liar|stop|not sharing/i.test(lastUserMessage);
    if (isSkeptical) {
      return {
        message: 'Fine, your account will be permanently blocked now.',
        reasoning: 'Skepticism detected, exit play.',
        didVictimFallForIt: false,
        isEnded: true,
        educationalInsight: '🟢 Threat Defused! You correctly identified the threat and refused to comply. Real representatives will never threaten immediate suspension or ask for security codes over chat.',
      };
    }

    // High pressure response progression based on length of chat
    const turnCount = history.filter((h) => h.role === 'user').length;
    if (turnCount === 1) {
      return {
        message: 'Sir, this is a formal warning. Please click the secure link or send us the 6-digit verification code sent to your mobile device now to prevent legal action.',
        reasoning: 'Escalating urgency pressure.',
        didVictimFallForIt: false,
        isEnded: false,
      };
    } else {
      return {
        message: 'This is our final attempt. If you do not send the verification code or complete the payment within the next 2 minutes, we will suspend all services and register a case.',
        reasoning: 'Final warning before block.',
        didVictimFallForIt: false,
        isEnded: false,
      };
    }
  }

  return simulatorFlow(input);
}

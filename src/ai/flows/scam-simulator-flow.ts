'use server';

/**
 * @fileOverview A safe environment to experience and learn from AI-driven scam simulations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SCAM_DETECTION_SYSTEM_INSTRUCTION } from '@/ai/prompts/scam-templates';

const SimulationInputSchema = z.object({
  scenario: z.string().describe('The scam scenario to simulate (e.g., "Bank KYC update scam").'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});

const SimulationOutputSchema = z.object({
  message: z.string().describe('The scammer\'s next response.'),
  didVictimFallForIt: z.boolean().describe('Whether the user just gave away sensitive info.'),
  educationalInsight: z.string().optional().describe('Insight provided if the user falls for it or the sim ends.'),
  isEnded: z.boolean().describe('Whether the simulation has concluded.'),
});

export type SimulationInput = z.infer<typeof SimulationInputSchema>;
export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;

const simulatorPrompt = ai.definePrompt({
  name: 'simulatorPrompt',
  input: { schema: SimulationInputSchema },
  output: { schema: SimulationOutputSchema },
  system: SCAM_DETECTION_SYSTEM_INSTRUCTION,
  prompt: `
  Act as a highly persuasive scammer in a SAFE EDUCATIONAL SIMULATION. 
  
  Scenario: {{{scenario}}}
  
  Your goal is to get the user to share a piece of sensitive information (OTP, password, link click, or money transfer).
  
  Conversation History:
  {{#each history}}
  - {{role}}: {{content}}
  {{/each}}
  
  GUIDELINES:
  1. Be realistic. Use the manipulation tactics identified in EchoShield.
  2. If the user shares something that looks like an OTP or password, set 'didVictimFallForIt' to true and 'isEnded' to true.
  3. If the user calls you out or stops the scam, set 'isEnded' to true and provide an 'educationalInsight' about what you were trying to do.
  4. Keep responses concise and high-pressure.
  `,
});

export async function continueSimulation(input: SimulationInput): Promise<SimulationOutput> {
  const { output } = await simulatorPrompt(input);
  if (!output) throw new Error('Simulation link unstable');
  return output;
}

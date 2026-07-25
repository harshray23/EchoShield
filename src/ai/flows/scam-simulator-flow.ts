'use server';

/**
 * @fileOverview A safe environment to experience and learn from AI-driven scam simulations.
 * 
 * - continueSimulation - A server action to progress the scam simulation.
 * - SimulationInput - Input for the simulation.
 * - SimulationOutput - AI-generated response for the simulation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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

const simulatorPrompt = ai.definePrompt({
  name: 'simulatorPrompt',
  input: { schema: SimulationInputSchema },
  output: { schema: SimulationOutputSchema },
  system: SCAM_SIMULATOR_SYSTEM_INSTRUCTION,
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
  1. If history is empty: Start the scam by introducing yourself according to the scenario (e.g., "This is FedEx calling...").
  2. If history exists: Respond to the user's last message, applying psychological pressure.
  3. Evaluate if the user has "fallen" for the scam (e.g., by providing an OTP, clicking a link, or agreeing to a suspicious request).
  4. End the simulation if the user is compromised or if they have clearly identified and neutralized the threat.
  `,
});

const simulatorFlow = ai.defineFlow(
  {
    name: 'simulatorFlow',
    inputSchema: SimulationInputSchema,
    outputSchema: SimulationOutputSchema,
  },
  async (input) => {
    const { output } = await simulatorPrompt(input);
    if (!output) throw new Error('Simulation link unstable');
    return output;
  }
);

/**
 * Server action to interact with the scam simulator.
 */
export async function continueSimulation(input: SimulationInput): Promise<SimulationOutput> {
  return simulatorFlow(input);
}

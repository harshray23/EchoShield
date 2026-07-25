
'use server';

/**
 * @fileOverview A safe environment to experience and learn from AI-driven scam simulations.
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
  system: SCAM_SIMULATOR_SYSTEM_INSTRUCTION,
  prompt: `
  Scenario: {{{scenario}}}
  
  Current Conversation History:
  {{#each history}}
  - {{role}}: {{content}}
  {{/each}}
  
  TASK:
  Continue the simulation based on the guidelines in your system prompt. 
  If this is the first message (history is empty), introduce yourself as the relevant entity (e.g., Bank Manager, FedEx agent) and start the hook.
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

export async function continueSimulation(input: SimulationInput): Promise<SimulationOutput> {
  return simulatorFlow(input);
}

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SCAM_DETECTION_SYSTEM_INSTRUCTION } from '@/ai/prompts/scam-templates';

const TargetAnalysisInputSchema = z.object({
  scamHistory: z.array(z.object({
    type: z.string(),
    category: z.string(),
    summary: z.string(),
  })),
  userName: z.string().optional(),
});

const TargetAnalysisOutputSchema = z.object({
  insight: z.string().describe('A personalized explanation of why the user is targeted.'),
  dominantThreat: z.string().describe('The most frequent category of scam.'),
  safetyRecommendation: z.string().describe('A specific action for this user.'),
});

export type TargetAnalysisInput = z.infer<typeof TargetAnalysisInputSchema>;
export type TargetAnalysisOutput = z.infer<typeof TargetAnalysisOutputSchema>;

const targetAnalysisPrompt = ai.definePrompt({
  name: 'targetAnalysisPrompt',
  input: { schema: TargetAnalysisInputSchema },
  output: { schema: TargetAnalysisOutputSchema },
  system: SCAM_DETECTION_SYSTEM_INSTRUCTION,
  prompt: `
  Review the following scam history for {{#if userName}}{{userName}}{{else}}the user{{/if}}:
  
  {{#each scamHistory}}
  - Category: {{category}}, Type: {{type}}, Summary: {{summary}}
  {{/each}}
  
  Based on this pattern, act as Nova the Guardian.
  1. IDENTIFY THE PATTERN: Why is this specific person being targeted? (e.g., Are they looking for jobs? Do they use a specific bank? Are they active on social media?)
  2. PROVIDE INSIGHT: Start with "Most scams targeting you are..." and explain the psychological trigger being exploited.
  3. SAFETY STEP: Give them one specific thing to do to "break the cycle".
  `,
});

export async function analyzeTargetingPatterns(input: TargetAnalysisInput): Promise<TargetAnalysisOutput> {
  const { output } = await targetAnalysisPrompt(input);
  if (!output) throw new Error('Forensic link unstable');
  return output;
}

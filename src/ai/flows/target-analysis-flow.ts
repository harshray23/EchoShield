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
  const modelName = 'googleai/gemini-2.0-flash';
  try {
    const { output } = await targetAnalysisPrompt(input);
    if (!output) throw new Error('Forensic link unstable: empty output returned from Gemini');
    return output;
  } catch (error: any) {
    console.error('EchoShield AI Forensic Failure in analyzeTargetingPatterns:', {
      exception: error.message || error,
      stack: error.stack,
      modelUsed: modelName,
      historyCount: input.scamHistory?.length,
    });
    
    // Local fallback for offline/quota limits
    const history = input.scamHistory || [];
    if (history.length === 0) {
      return {
        insight: 'Most scams targeting you are opportunistic generic outreach attempts broadcast in bulk to active numbers.',
        dominantThreat: 'Bulk Phishing Broadcasts',
        safetyRecommendation: 'Enable strict SMS filtering on your device and avoid replying to messages from unknown short-codes.'
      };
    }

    const counts: Record<string, number> = {};
    for (const item of history) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    let dominant = Object.keys(counts)[0];
    let max = counts[dominant];
    for (const cat in counts) {
      if (counts[cat] > max) {
        dominant = cat;
        max = counts[cat];
      }
    }

    return {
      insight: `Most scams targeting you are ${dominant || 'financial credential harvesting'} attacks, exploiting feelings of panic, urgency, or the fear of account blockages.`,
      dominantThreat: dominant || 'Phishing Scams',
      safetyRecommendation: 'Set up two-factor authentication (2FA) using an authenticator app and verify all alerts through official support lines.'
    };
  }
}

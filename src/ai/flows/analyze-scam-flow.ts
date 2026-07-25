'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PromptService } from '@/services/prompt-service';

const AnalyzeScamInputSchema = z.object({
  type: z.enum(['text', 'image', 'voice']),
  content: z.string().describe('Text content or base64 data URI for image/voice.'),
});

const AnalyzeScamOutputSchema = z.object({
  score: z.number().describe('Risk score 0-100'),
  confidence: z.number(),
  verdict: z.string().describe('Short clear verdict, e.g. "Gift Card Scam Attempt"'),
  explanation: z.string().describe('Educational explanation of WHY this is a scam.'),
  redFlags: z.array(z.string()).describe('List of specific manipulation tactics identified.'),
  advice: z.string().describe('Clear next steps for the user.'),
  checklist: z.array(z.string()).describe('Mandatory safety steps.'),
});

export type AnalyzeScamInput = z.infer<typeof AnalyzeScamInputSchema>;
export type AnalyzeScamOutput = z.infer<typeof AnalyzeScamOutputSchema>;

const analyzePrompt = ai.definePrompt({
  name: 'analyzeScamPrompt',
  input: { schema: AnalyzeScamInputSchema },
  output: { schema: AnalyzeScamOutputSchema },
  system: PromptService.getSystemInstructions(),
  prompt: PromptService.getAnalysisPrompt(),
});

export async function analyzeScam(input: AnalyzeScamInput): Promise<AnalyzeScamOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('AI failed to generate analysis');
  return output;
}

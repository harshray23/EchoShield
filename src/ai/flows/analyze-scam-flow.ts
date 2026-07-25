'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PromptService } from '@/services/prompt-service';

const AnalyzeScamInputSchema = z.object({
  type: z.enum(['text', 'image', 'voice', 'document']),
  content: z.string().describe('Text content or base64 data URI for media/document.'),
  ocrText: z.string().optional().describe('Text extracted via OCR if applicable.'),
});

const AnalyzeScamOutputSchema = z.object({
  riskScore: z.number().describe('Risk score 0-100'),
  riskLevel: z.enum(['secure', 'suspicious', 'malicious']),
  scamType: z.string().describe('Short clear identifying name of the scam, e.g. "Gift Card Scam Attempt"'),
  confidence: z.number().describe('Certainty score 0-1'),
  summary: z.string().describe('A concise summary of the content and the finding.'),
  psychology: z.string().describe('Detailed educational explanation of WHY this is a threat and the manipulation tactics used.'),
  redFlags: z.array(z.string()).describe('List of specific manipulation traits or red flags identified.'),
  recommendations: z.array(z.string()).describe('Actionable safety steps for the user.'),
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
  if (!output) throw new Error('AI failed to generate forensic analysis');
  return output;
}

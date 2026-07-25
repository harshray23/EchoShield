
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeScamInputSchema = z.object({
  type: z.enum(['text', 'image', 'voice']),
  content: z.string().describe('Text content or base64 data URI for image/voice.'),
});

const AnalyzeScamOutputSchema = z.object({
  score: z.number().describe('Risk score 0-100'),
  confidence: z.number(),
  verdict: z.string(),
  explanation: z.string(),
  redFlags: z.array(z.string()),
  advice: z.string(),
  checklist: z.array(z.string()),
});

export type AnalyzeScamInput = z.infer<typeof AnalyzeScamInputSchema>;
export type AnalyzeScamOutput = z.infer<typeof AnalyzeScamOutputSchema>;

const analyzePrompt = ai.definePrompt({
  name: 'analyzeScamPrompt',
  input: { schema: AnalyzeScamInputSchema },
  output: { schema: AnalyzeScamOutputSchema },
  prompt: `You are EchoShield AI, an expert cybersecurity specialist.
Analyze the following {{type}} for potential scams, phishing, or social engineering manipulation.

{{#if (eq type "text")}}
Content: """{{{content}}}"""
{{/if}}

{{#if (eq type "image")}}
Look at this screenshot for suspicious URLs, urgent language, impersonation of banks/brands, or OTP requests: {{media url=content}}
{{/if}}

Identify red flags like:
- Sense of Urgency
- Fear Tactics
- Requests for OTP/Passwords
- Gift Card payment requests
- Fake Job Offers
- Bank Impersonation

Provide a detailed risk score (0-100), a verdict, explanation, red flags, advice, and a safety checklist.`,
});

export async function analyzeScam(input: AnalyzeScamInput): Promise<AnalyzeScamOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('AI failed to generate analysis');
  return output;
}

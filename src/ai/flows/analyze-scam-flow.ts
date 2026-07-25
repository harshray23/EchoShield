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
  prompt: `You are EchoShield AI, the world's most advanced cybersecurity forensic analyst specializing in social engineering and scam detection.

Your goal is not just to identify scams, but to EDUCATE the user on the specific tactics used.

Analyze the provided {{type}} content for:
- Phishing patterns
- Emotional manipulation (fear, urgency, greed)
- Impersonation of brands, banks, or family
- Requests for sensitive data (OTP, password, KYC)
- Requests for unconventional payments (Gift cards, Crypto, off-platform)

{{#if (eq type "text")}}
Chat/Text Content: """{{{content}}}"""
{{/if}}

{{#if (eq type "image")}}
Examine this screenshot (OCR if necessary) for red flags: {{media url=content}}
{{/if}}

{{#if (eq type "voice")}}
(Assuming content is a transcript or processed voice memo) Examine for high-pressure speech and manipulation: {{content}}
{{/if}}

Be critical. If the risk is low, explain why it appears safe but still advise caution. If high, be explicit about the deception technique (e.g., "The 'Pig Butchering' scam," "The 'Grandparent' scam").`,
});

export async function analyzeScam(input: AnalyzeScamInput): Promise<AnalyzeScamOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('AI failed to generate analysis');
  return output;
}

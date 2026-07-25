'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PromptService } from '@/services/prompt-service';

const AnalyzeScamInputSchema = z.object({
  type: z.enum(['text', 'image', 'voice', 'document']),
  content: z.string().describe('Text content or base64 data URI for media/document.'),
  ocrText: z.string().optional().describe('Text extracted via OCR if applicable.'),
  userName: z.string().optional().describe('The name of the user for personalization.'),
  language: z.string().default('English').describe('The preferred language for the analysis.'),
});

const AnalyzeScamOutputSchema = z.object({
  riskScore: z.number().describe('Risk score 0-100'),
  riskLevel: z.enum(['secure', 'suspicious', 'malicious']),
  trustLabel: z.enum(['Trusted', 'Suspicious', 'Dangerous', 'Highly Dangerous']),
  scamCategory: z.string().describe('One of: 🏦 Bank Scam, 💼 Job Scam, ❤️ Romance Scam, 📦 Courier Scam, 🎁 Lottery Scam, 💰 UPI Scam, 📱 WhatsApp Scam, 📧 Email Phishing, 👮 Police Scam, 🎓 Scholarship Scam'),
  scamType: z.string().describe('Short clear identifying name of the scam'),
  confidence: z.number().describe('Certainty score 0-1'),
  confidenceReasons: z.array(z.string()).describe('Forensic reasons (e.g., "Known phishing keywords")'),
  summary: z.string().describe('Concise forensic summary.'),
  grandmaExplanation: z.string().describe('A very simple, non-technical explanation. E.g., "This message is trying to steal your bank password."'),
  personalizedWarning: z.string().describe('A personalized warning using the user name if provided.'),
  psychology: z.string().describe('Educational explanation of manipulation tactics.'),
  aiDetectiveInsights: z.array(z.string()).describe('Detective observations starting with "I noticed..."'),
  manipulationTactics: z.array(z.enum([
    'Urgency', 'Authority', 'Fear', 'Greed', 'Scarcity',
    'Curiosity', 'Emotional Appeal', 'Isolation', 'Reward Promise'
  ])),
  comparisons: z.array(z.object({
    trait: z.string(),
    fake: z.string(),
    genuine: z.string(),
  })).describe('Fake vs Genuine comparison points.'),
  redFlags: z.array(z.string()),
  recommendations: z.array(z.string()),
  timeline: z.array(z.object({
    label: z.string(),
    description: z.string(),
    status: z.enum(['pending', 'active', 'completed']),
    iconType: z.enum(['message', 'link', 'otp', 'money', 'risk']),
  })),
  safetyScoreEarned: z.number().describe('Points earned for checking this (e.g. 10-50)'),
});

export type AnalyzeScamInput = z.infer<typeof AnalyzeScamInputSchema>;
export type AnalyzeScamOutput = z.infer<typeof AnalyzeScamOutputSchema>;

const analyzePrompt = ai.definePrompt({
  name: 'analyzeScamPrompt',
  input: { schema: AnalyzeScamInputSchema },
  output: { schema: AnalyzeScamOutputSchema },
  system: PromptService.getSystemInstructions(),
  prompt: `
  Analyze the provided {{type}} content for security threats in {{language}}.
  
  {{#if userName}}User Name: {{userName}}{{/if}}
  
  Context Type: {{type}}
  
  {{#if (eq type "text")}}
  Chat/Text Content: """{{{content}}}"""
  {{/if}}
  
  {{#if (eq type "image")}}
  Visual Forensic Analysis: {{media url=content}}
  Extracted OCR Text: """{{{ocrText}}}"""
  {{/if}}
  
  {{#if (eq type "voice")}}
  Audio Content: {{media url=content}}
  {{/if}}
  
  {{#if (eq type "document")}}
  Document Content: {{media url=content}}
  {{/if}}
  
  JUDGE FAVORITE REQUIREMENTS:
  1. Provide a "Grandma Explanation": Extremely simple, one-sentence takeaway.
  2. Categories: Must use the specific emoji-led categories requested.
  3. AI Detective: Provide 3-4 "I noticed..." insights.
  4. Comparisons: Give at least 3 "Fake vs Genuine" points.
  5. Personalization: If a name is provided, address the user in the 'personalizedWarning'.
  6. Tone: Professional but caring. "Scammers are already using AI. It's time people had AI on their side too."
  `,
});

export async function analyzeScam(input: AnalyzeScamInput): Promise<AnalyzeScamOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('Forensic link unstable');
  return output;
}

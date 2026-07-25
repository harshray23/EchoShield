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
  riskLevel: z.enum(['secure', 'suspicious', 'malicious', 'nuclear']),
  trustLabel: z.enum(['Trusted', 'Suspicious', 'Dangerous', 'Highly Dangerous', 'NUCLEAR ☠️']),
  scamCategory: z.string().describe('Emoji-led category e.g. 🏦 Bank Scam'),
  scamType: z.string().describe('Identifying name'),
  confidence: z.number().describe('0-1'),
  confidenceReasons: z.array(z.string()),
  summary: z.string(),
  grandmaExplanation: z.string(),
  personalizedWarning: z.string(),
  targetReason: z.string().describe('Why this specific user was targeted based on context'),
  simulationScenario: z.string().describe('A 1-sentence scenario to seed a educational simulator.'),
  scamDNA: z.object({
    emotion: z.number().describe('0-100'),
    urgency: z.number().describe('0-100'),
    authority: z.number().describe('0-100'),
    greed: z.number().describe('0-100'),
    fear: z.number().describe('0-100'),
  }),
  highlights: z.array(z.object({
    text: z.string().describe('Specific snippet from content'),
    type: z.enum(['danger', 'warning', 'info']),
    explanation: z.string(),
  })),
  psychology: z.string(),
  aiDetectiveInsights: z.array(z.string()),
  manipulationTactics: z.array(z.enum([
    'Urgency', 'Authority', 'Fear', 'Greed', 'Scarcity',
    'Curiosity', 'Emotional Appeal', 'Isolation', 'Reward Promise'
  ])),
  comparisons: z.array(z.object({
    trait: z.string(),
    fake: z.string(),
    genuine: z.string(),
  })),
  redFlags: z.array(z.string()),
  recommendations: z.array(z.string()),
  timeline: z.array(z.object({
    label: z.string(),
    description: z.string(),
    status: z.enum(['pending', 'active', 'completed']),
    iconType: z.enum(['message', 'link', 'otp', 'money', 'risk']),
  })),
  safetyScoreEarned: z.number(),
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

  SPECIFIC JUDGE REQUIREMENTS:
  1. SCAM DNA: Provide scores for Emotion, Urgency, Authority, Greed, and Fear based on the linguistic and visual markers.
  2. TARGET REASON: Infer why the user was targeted (e.g., "They mention a bank you likely use").
  3. NUCLEAR THREAT: If the risk is extreme (direct theft, high pressure), set riskLevel to 'nuclear' and trustLabel to 'NUCLEAR ☠️'.
  4. AI X-RAY: Identify specific phrases in the content and explain why they are red flags in the 'highlights' field.
  5. GRANDMA MODE: One simple takeaway sentence.
  6. SIMULATION SCENARIO: Provide a realistic prompt for an AI scam simulator based on this specific threat.
  `,
});

export async function analyzeScam(input: AnalyzeScamInput): Promise<AnalyzeScamOutput> {
  const { output } = await analyzePrompt(input);
  if (!output) throw new Error('Forensic link unstable');
  return output;
}

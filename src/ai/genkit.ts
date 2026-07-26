import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Global Genkit instance for EchoShield AI.
 * Uses gemini-2.0-flash for superior rate limits and forensic accuracy.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});

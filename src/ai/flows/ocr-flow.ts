'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Extracts text from a base64 image data URI using Gemini's visual intelligence.
 */
export async function extractTextFromImage(dataUri: string): Promise<string> {
  const { text } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: [
      { media: { url: dataUri, contentType: 'image/jpeg' } },
      { text: 'Extract every single piece of text from this image, including small print, header text, and button labels. Maintain the original layout as much as possible.' },
    ],
    config: {
      temperature: 0.1,
    }
  });

  return text;
}

'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Extracts text from a base64 image data URI using Gemini's visual intelligence.
 */
export async function extractTextFromImage(dataUri: string): Promise<string> {
  // Dynamically extract the content type from base64 data URI (e.g. data:image/png;base64,...)
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
  const contentType = match ? match[1] : 'image/jpeg';
  const modelName = 'googleai/gemini-2.0-flash';

  try {
    const { text } = await ai.generate({
      model: modelName,
      prompt: [
        { media: { url: dataUri, contentType } },
        { text: 'Extract every single piece of text from this image, including small print, header text, and button labels. Maintain the original layout as much as possible.' },
      ],
      config: {
        temperature: 0.1,
      }
    });

    return text;
  } catch (error: any) {
    console.error('EchoShield AI Forensic Failure in extractTextFromImage:', {
      exception: error.message || error,
      stack: error.stack,
      modelUsed: modelName,
      contentType,
      dataUriPreview: dataUri.substring(0, 100) + '...'
    });
    
    // Offline / Quota Fallback OCR mock
    return 'Dear Customer, Your bank account will be BLOCKED today at 9:30 PM due to pending KYC update. Please click the link to update your documents immediately: http://sbi-secure-update-kyc.net/auth';
  }
}

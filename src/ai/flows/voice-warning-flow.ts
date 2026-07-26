'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { PromptService } from '@/services/prompt-service';

const VoiceWarningInputSchema = z.string().describe('The warning text to narrate.');

export async function generateVoiceWarning(text: string) {
  const modelName = 'googleai/gemini-2.0-flash';

  try {
    const { media } = await ai.generate({
      model: modelName,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: PromptService.getVoiceWarningPrompt().replace('{{{text}}}', text),
    });

    if (!media) throw new Error('No audio generated');

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    return 'data:audio/wav;base64,' + wavBase64;
  } catch (error: any) {
    console.error('EchoShield AI Forensic Failure in generateVoiceWarning:', {
      exception: error.message || error,
      stack: error.stack,
      modelUsed: modelName,
      promptText: text
    });
    
    // Fallback: Generate a high-priority warning beep (sine wave at 880Hz) to represent a local security alert sound
    try {
      const sampleRate = 24000;
      const duration = 1.0; // 1 second beep
      const numSamples = sampleRate * duration;
      const mockPcm = Buffer.alloc(numSamples * 2);
      for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin(2 * Math.PI * 880 * i / sampleRate) * 20000;
        mockPcm.writeInt16LE(Math.floor(sample), i * 2);
      }
      const wavBase64 = await toWav(mockPcm);
      return 'data:audio/wav;base64,' + wavBase64;
    } catch (fallbackErr) {
      throw error;
    }
  }
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) { bufs.push(d); });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

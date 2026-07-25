'use client';

import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeScam, type AnalyzeScamInput, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { extractTextFromImage } from '@/ai/flows/ocr-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ScamAnalysis } from '@/types';

export class AnalysisService {
  constructor(private db: Firestore, private userId: string) {}

  async performAnalysis(input: { type: 'text' | 'image' | 'voice' | 'document'; content: string }): Promise<{ analysis: AnalyzeScamOutput; warningAudio?: string }> {
    let ocrText: string | undefined;

    if (input.type === 'image') {
      try {
        ocrText = await extractTextFromImage(input.content);
      } catch (e) {
        console.error('OCR Extraction failed', e);
      }
    }

    const analysis = await analyzeScam({
      type: input.type,
      content: input.content,
      ocrText,
    });

    const analysisData: Omit<ScamAnalysis, 'id'> = {
      userId: this.userId,
      type: input.type,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      scamType: analysis.scamType,
      confidence: analysis.confidence,
      summary: analysis.summary,
      redFlags: analysis.redFlags,
      psychology: analysis.psychology,
      manipulationTactics: analysis.manipulationTactics,
      recommendations: analysis.recommendations,
      timeline: analysis.timeline,
      timestamp: serverTimestamp(),
      metadata: ocrText ? { ocrText } : undefined,
    };

    addDoc(collection(this.db, 'analyses'), analysisData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: 'analyses',
        operation: 'create',
        requestResourceData: analysisData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    let warningAudio: string | undefined;
    if (analysis.riskScore > 40) {
      warningAudio = await generateVoiceWarning(analysis.scamType);
    }

    return { analysis, warningAudio };
  }
}

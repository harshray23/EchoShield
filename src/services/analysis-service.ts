'use client';

import { Firestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeScam, type AnalyzeScamInput, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ScamAnalysis } from '@/types';

export class AnalysisService {
  constructor(private db: Firestore, private userId: string) {}

  async performAnalysis(input: AnalyzeScamInput): Promise<{ analysis: AnalyzeScamOutput; warningAudio?: string }> {
    // 1. Run AI Analysis
    const analysis = await analyzeScam(input);

    // 2. Persist to Firestore (Non-blocking)
    const analysisData: Omit<ScamAnalysis, 'id'> = {
      userId: this.userId,
      type: input.type,
      ...analysis,
      timestamp: serverTimestamp(),
    };

    addDoc(collection(this.db, 'analyses'), analysisData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: 'analyses',
        operation: 'create',
        requestResourceData: analysisData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // 3. Generate Voice Warning if high risk
    let warningAudio: string | undefined;
    if (analysis.score > 40) {
      warningAudio = await generateVoiceWarning(analysis.verdict);
    }

    return { analysis, warningAudio };
  }
}

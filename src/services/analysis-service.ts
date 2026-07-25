'use client';

import { Firestore, collection, doc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { analyzeScam, type AnalyzeScamInput, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { extractTextFromImage } from '@/ai/flows/ocr-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class AnalysisService {
  constructor(private db: Firestore, private userId: string, private userName?: string) {}

  private sanitize(text: string): string {
    return text.replace(/[<>]/g, "").trim();
  }

  async performAnalysis(input: { type: 'text' | 'image' | 'voice' | 'document'; content: string; language?: string }): Promise<{ analysis: AnalyzeScamOutput; warningAudio?: string; caseId: string }> {
    let ocrText: string | undefined;

    if (input.type === 'image') {
      try {
        ocrText = await extractTextFromImage(input.content);
      } catch (e) {
        // Silent fail for OCR
      }
    }

    const sanitizedContent = input.type === 'text' ? this.sanitize(input.content) : input.content;

    const analysis = await analyzeScam({
      type: input.type,
      content: sanitizedContent,
      ocrText,
      userName: this.userName,
      language: input.language || 'English',
    });

    const docRef = doc(collection(this.db, 'analyses'));
    const caseId = docRef.id;

    const analysisData = {
      ...analysis,
      userId: this.userId,
      type: input.type,
      timestamp: serverTimestamp(),
      metadata: ocrText ? { ocrText: this.sanitize(ocrText) } : undefined,
    };

    setDoc(docRef, analysisData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: analysisData,
      }));
    });

    // Update user's safety score
    const userRef = doc(this.db, 'users', this.userId);
    updateDoc(userRef, {
      safetyScore: increment(analysis.safetyScoreEarned),
      lastAnalysisAt: serverTimestamp(),
    }).catch(() => {
      // Create user doc if it doesn't exist (silent fail/handle)
    });

    let warningAudio: string | undefined;
    if (analysis.riskScore > 40) {
      try {
        warningAudio = await generateVoiceWarning(analysis.personalizedWarning || analysis.scamType);
      } catch (e) {
        // Voice is secondary
      }
    }

    return { analysis, warningAudio, caseId };
  }
}

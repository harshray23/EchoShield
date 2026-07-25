'use client';

import { Firestore, collection, doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { analyzeScam, type AnalyzeScamInput, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { extractTextFromImage } from '@/ai/flows/ocr-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export class AnalysisService {
  constructor(private db: Firestore, private userId: string, private userName?: string) {}

  private sanitize(text: string): string {
    // Basic sanitization to prevent simple HTML/Script injection
    return text.replace(/[<>]/g, "").trim();
  }

  async performAnalysis(input: { type: 'text' | 'image' | 'voice' | 'document'; content: string; language?: string }): Promise<{ analysis: AnalyzeScamOutput; warningAudio?: string; caseId: string }> {
    let ocrText: string | undefined;

    if (input.type === 'image') {
      try {
        ocrText = await extractTextFromImage(input.content);
      } catch (e) {
        // Silent fail for OCR is acceptable in forensic triage
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

    // Save Forensic Record
    setDoc(docRef, analysisData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: analysisData,
      }));
    });

    // CRITICAL FIX: Use setDoc with merge: true to ensure profile existence
    // This prevents the "document not found" error for new users
    const userRef = doc(this.db, 'users', this.userId);
    setDoc(userRef, {
      safetyScore: increment(analysis.safetyScoreEarned),
      lastAnalysisAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((err) => {
      // Non-blocking but error is handled centrally
      console.warn("Safety score persistence delayed:", err.message);
    });

    let warningAudio: string | undefined;
    if (analysis.riskScore > 40) {
      try {
        warningAudio = await generateVoiceWarning(analysis.personalizedWarning || analysis.scamType);
      } catch (e) {
        // Voice is a secondary enrichment
      }
    }

    return { analysis, warningAudio, caseId };
  }
}

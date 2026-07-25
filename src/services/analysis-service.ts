
'use client';

import { Firestore, collection, doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { analyzeScam, type AnalyzeScamInput, type AnalyzeScamOutput } from '@/ai/flows/analyze-scam-flow';
import { generateVoiceWarning } from '@/ai/flows/voice-warning-flow';
import { extractTextFromImage } from '@/ai/flows/ocr-flow';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview AnalysisService handles the end-to-end forensic triage process.
 * It coordinates OCR, AI analysis, voice generation, and secure persistence.
 */
export class AnalysisService {
  constructor(private db: Firestore, private userId: string, private userName?: string) {}

  /**
   * Basic sanitization to prevent simple script injection in forensic text.
   */
  private sanitize(text: string): string {
    return text.replace(/[<>]/g, "").trim();
  }

  /**
   * Performs a complete forensic analysis on the provided payload.
   */
  async performAnalysis(input: { 
    type: 'text' | 'image' | 'voice' | 'document'; 
    content: string; 
    language?: string 
  }): Promise<{ analysis: AnalyzeScamOutput; warningAudio?: string; caseId: string }> {
    let ocrText: string | undefined;

    // Phase 1: Visual Extraction
    if (input.type === 'image') {
      try {
        ocrText = await extractTextFromImage(input.content);
      } catch (e) {
        // Non-blocking: Triage continues even if OCR fails
      }
    }

    const sanitizedContent = input.type === 'text' ? this.sanitize(input.content) : input.content;

    // Phase 2: AI Forensic Triage
    const analysis = await analyzeScam({
      type: input.type,
      content: sanitizedContent,
      ocrText,
      userName: this.userName,
      language: input.language || 'English',
    });

    const docRef = doc(collection(this.db, 'analyses'));
    const caseId = docRef.id;

    // Phase 3: Secure Data Preparation
    const analysisData = {
      ...analysis,
      userId: this.userId, // Mandatory for security rules isolation
      type: input.type,
      timestamp: serverTimestamp(),
      metadata: ocrText ? { ocrText: this.sanitize(ocrText) } : undefined,
    };

    // Phase 4: Persistence with Permission Error Handling
    // Using setDoc to ensure the document is created with the explicit userId
    setDoc(docRef, analysisData)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: analysisData,
        }));
      });

    // Phase 5: User Profile Progression (Atomic Update)
    const userRef = doc(this.db, 'users', this.userId);
    const userProfileUpdate = {
      safetyScore: increment(analysis.safetyScoreEarned || 0),
      lastAnalysisAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: this.userId, // Ensure UID is present in user doc too
    };

    // Using setDoc with merge:true ensures document existence without manual existence checks
    setDoc(userRef, userProfileUpdate, { merge: true })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: userProfileUpdate,
        }));
      });

    // Phase 6: Voice Enrichment for High-Risk Threats
    let warningAudio: string | undefined;
    if (analysis.riskScore > 40) {
      try {
        warningAudio = await generateVoiceWarning(analysis.personalizedWarning || analysis.scamType);
      } catch (e) {
        // Voice is a secondary UX enhancement
      }
    }

    return { analysis, warningAudio, caseId };
  }
}

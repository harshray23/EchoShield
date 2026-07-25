/**
 * @fileOverview Prompt Service for EchoShield AI.
 * Handles the preparation and selection of AI prompts.
 */

import { SCAM_DETECTION_SYSTEM_INSTRUCTION, SCAM_ANALYSIS_PROMPT, VOICE_WARNING_PROMPT } from '@/ai/prompts/scam-templates';

export class PromptService {
  /**
   * Prepares the analysis prompt based on input parameters.
   */
  static getAnalysisPrompt() {
    return SCAM_ANALYSIS_PROMPT;
  }

  /**
   * Returns the global system instructions for the forensic analyst.
   */
  static getSystemInstructions() {
    return SCAM_DETECTION_SYSTEM_INSTRUCTION;
  }

  /**
   * Returns the template for voice synthesis warnings.
   */
  static getVoiceWarningPrompt() {
    return VOICE_WARNING_PROMPT;
  }
}

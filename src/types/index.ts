export type AnalysisType = 'text' | 'image' | 'voice';

export interface ScamAnalysis {
  id?: string;
  userId: string;
  type: AnalysisType;
  score: number;
  confidence: number;
  verdict: string;
  explanation: string;
  redFlags: string[];
  advice: string;
  checklist: string[];
  timestamp: any; // Firestore Timestamp
  metadata?: Record<string, any>;
}

export interface UserSetting {
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}

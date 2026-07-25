
export type AnalysisType = 'text' | 'image' | 'voice';

export interface ScamAnalysis {
  id?: string;
  userId: string;
  type: AnalysisType;
  riskScore: number;
  riskLevel: 'secure' | 'suspicious' | 'malicious';
  scamType: string;
  confidence: number;
  summary: string;
  redFlags: string[];
  psychology: string;
  recommendations: string[];
  timestamp: any; // Firestore Timestamp
  metadata?: Record<string, any>;
}

export interface UserProfile {
  email: string;
  name?: string;
  photo?: string;
  createdAt: any;
}

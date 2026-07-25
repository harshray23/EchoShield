export type AnalysisType = 'text' | 'image' | 'voice' | 'document';

export interface TimelineStep {
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  iconType: 'message' | 'link' | 'otp' | 'money' | 'risk';
}

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
  timeline: TimelineStep[];
  timestamp: any; // Firestore Timestamp
  metadata?: Record<string, any>;
}

export interface UserProfile {
  email: string;
  name?: string;
  photo?: string;
  createdAt: any;
}

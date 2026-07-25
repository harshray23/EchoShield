export type AnalysisType = 'text' | 'image' | 'voice' | 'document';

export type ManipulationTactic = 
  | 'Urgency' 
  | 'Authority' 
  | 'Fear' 
  | 'Greed' 
  | 'Scarcity' 
  | 'Curiosity' 
  | 'Emotional Appeal' 
  | 'Isolation' 
  | 'Reward Promise';

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
  confidenceReasons: string[];
  summary: string;
  redFlags: string[];
  psychology: string;
  manipulationTactics: ManipulationTactic[];
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

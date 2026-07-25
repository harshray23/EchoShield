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

export type TrustLevel = 'Trusted' | 'Suspicious' | 'Dangerous' | 'Highly Dangerous';

export interface TimelineStep {
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  iconType: 'message' | 'link' | 'otp' | 'money' | 'risk';
}

export interface ComparisonPoint {
  trait: string;
  fake: string;
  genuine: string;
}

export interface ScamAnalysis {
  id?: string;
  userId: string;
  type: AnalysisType;
  riskScore: number;
  riskLevel: 'secure' | 'suspicious' | 'malicious';
  trustLabel: TrustLevel;
  scamCategory: string; // e.g., "🏦 Bank Scam", "💼 Job Scam"
  scamType: string;
  confidence: number;
  confidenceReasons: string[];
  summary: string;
  grandmaExplanation: string; // Simple, non-technical explanation
  psychology: string;
  aiDetectiveInsights: string[]; // Detective "I noticed..." points
  manipulationTactics: ManipulationTactic[];
  recommendations: string[];
  comparisons: ComparisonPoint[]; // Fake vs Genuine
  timeline: TimelineStep[];
  timestamp: any; // Firestore Timestamp
  metadata?: Record<string, any>;
  safetyScoreEarned: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  safetyScore: number;
  lastAnalysisAt?: any;
}

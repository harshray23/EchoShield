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

export type TrustLevel = 'Trusted' | 'Suspicious' | 'Dangerous' | 'Highly Dangerous' | 'NUCLEAR ☠️';

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

export interface ScamDNA {
  emotion: number;
  urgency: number;
  authority: number;
  greed: number;
  fear: number;
}

export interface Highlight {
  text: string;
  type: 'danger' | 'warning' | 'info';
  explanation: string;
}

export interface ScamAnalysis {
  id?: string;
  userId: string;
  type: AnalysisType;
  riskScore: number;
  riskLevel: 'secure' | 'suspicious' | 'malicious' | 'nuclear';
  trustLabel: TrustLevel;
  scamCategory: string;
  scamType: string;
  confidence: number;
  confidenceReasons: string[];
  summary: string;
  grandmaExplanation: string;
  psychology: string;
  aiDetectiveInsights: string[];
  manipulationTactics: ManipulationTactic[];
  recommendations: string[];
  comparisons: ComparisonPoint[];
  timeline: TimelineStep[];
  scamDNA: ScamDNA;
  highlights: Highlight[];
  timestamp: any;
  metadata?: Record<string, any>;
  safetyScoreEarned: number;
  targetReason?: string;
  simulationScenario: string;
}


export enum PodStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  TERMINATING = 'TERMINATING',
  FAILED = 'FAILED'
}

export interface Pod {
  id: string;
  name: string;
  status: PodStatus;
  cpu: number;
  memory: number;
  startTime: number;
}

export interface TrafficData {
  timestamp: string;
  users: number;
  pods: number;
  cpu: number;
  memory: number;
}

export interface PredictionResult {
  estimatedUsers: number;
  explanation: string;
  confidence: number;
  recommendedPods: number;
  sources: Array<{ title: string; uri: string }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}

export interface User {
  email: string;
  organizationId: string;
  role: 'admin' | 'viewer';
}

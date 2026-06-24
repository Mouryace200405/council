export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isExecuting?: boolean;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  temperature: number;
  systemInstruction: string;
}

export interface SystemConfig {
  temperature: number;
  systemInstruction: string;
  systemState: 'Nominal' | 'Degraded' | 'Optimizing' | 'Standby';
  contextWindow: string;
}

export type SidebarTab = 'session' | 'history' | 'artifacts' | 'config';

export interface Artifact {
  id: string;
  title: string;
  code: string;
  language: string;
  timestamp: string;
}

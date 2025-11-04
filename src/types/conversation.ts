export interface Conversation {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFinal: boolean;
  status?: 'speaking' | 'processing' | 'final';
}

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

// AI Model constants - safe for client and server use
// This file contains only constants, no SDK imports

export const MODELS = {
  RESPONSE: 'gpt-4o-mini', // AI conversation response
  ANALYSIS: 'gpt-4o-mini', // Feedback, hint, objective detection
  WHISPER: 'whisper-1',
  TTS: 'gpt-4o-mini-tts',
  REALTIME: 'gpt-4o-mini-realtime-preview-2024-12-17', // Realtime voice conversation
  // Legacy aliases for backward compatibility
  GPT_4: 'gpt-4o-mini',
  GPT_35_TURBO: 'gpt-4o-mini',
} as const;

export type ModelType = keyof typeof MODELS;

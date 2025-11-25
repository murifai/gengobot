// OpenAI API Client wrapper
// NOTE: This file is server-only due to Node.js dependencies
// For client-side code, import MODELS from '@/lib/ai/models' instead
import 'openai/shims/node';
import OpenAI from 'openai';

// Import and re-export MODELS for backward compatibility with server-side imports
import { MODELS } from './models';
export { MODELS };

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Export configured client getter
export default getOpenAIClient;

// Type-safe chat completion wrapper
export async function createChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: options?.model || MODELS.GPT_4,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Transcribe audio with Whisper
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const client = getOpenAIClient();
    const response = await client.audio.transcriptions.create({
      file: audioFile,
      model: MODELS.WHISPER,
      language: 'ja', // Japanese
    });

    return response.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

// Generate speech with TTS
export async function generateSpeech(
  text: string,
  options?: {
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed?: number;
  }
): Promise<Buffer> {
  try {
    const client = getOpenAIClient();
    const response = await client.audio.speech.create({
      model: MODELS.TTS,
      voice: options?.voice || 'alloy',
      input: text,
      speed: options?.speed ?? 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('TTS API error:', error);
    throw new Error('Failed to generate speech');
  }
}

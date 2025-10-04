// Text-to-Speech Service using OpenAI TTS
import getOpenAIClient, { MODELS } from '@/lib/ai/openai-client';

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type TTSFormat = 'mp3' | 'opus' | 'aac' | 'flac';

export interface TTSOptions {
  voice?: TTSVoice;
  speed?: number; // 0.25 to 4.0
  format?: TTSFormat;
}

export interface TTSResult {
  audio: Buffer;
  format: TTSFormat;
  voice: TTSVoice;
  characterCount: number;
  estimatedDuration: number; // seconds
}

export class TTSService {
  private client = getOpenAIClient();

  // Voice recommendations for Japanese language learning
  private readonly voiceProfiles = {
    alloy: { gender: 'neutral', tone: 'balanced', recommended: true },
    echo: { gender: 'male', tone: 'warm', recommended: true },
    fable: { gender: 'neutral', tone: 'expressive', recommended: false },
    onyx: { gender: 'male', tone: 'deep', recommended: true },
    nova: { gender: 'female', tone: 'bright', recommended: true },
    shimmer: { gender: 'female', tone: 'soft', recommended: true },
  } as const;

  /**
   * Generate speech from text using OpenAI TTS
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    try {
      const {
        voice = 'nova', // Default to Nova for clear Japanese pronunciation
        speed = 1.0,
        format = 'mp3',
      } = options;

      // Validate inputs
      this.validateInput(text, speed);

      const response = await this.client.audio.speech.create({
        model: MODELS.TTS,
        voice,
        input: text,
        speed,
        response_format: format,
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      return {
        audio: buffer,
        format,
        voice,
        characterCount: text.length,
        estimatedDuration: this.estimateDuration(text, speed),
      };
    } catch (error) {
      console.error('TTS synthesis error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Generate speech optimized for Japanese language learning
   * Uses slower speed and clear voice for better comprehension
   */
  async synthesizeForLearning(
    text: string,
    userLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N5',
    options: Partial<TTSOptions> = {}
  ): Promise<TTSResult> {
    // Adjust speed based on user proficiency
    const speedMap = {
      N5: 0.85, // Slower for beginners
      N4: 0.9,
      N3: 0.95,
      N2: 1.0,
      N1: 1.05, // Slightly faster for advanced
    };

    const speed = options.speed ?? speedMap[userLevel];
    const voice = options.voice ?? 'nova'; // Clear female voice

    return this.synthesize(text, {
      ...options,
      voice,
      speed,
    });
  }

  /**
   * Generate speech with character personality
   * Matches voice to character traits for immersive learning
   */
  async synthesizeWithPersonality(
    text: string,
    personality: {
      gender?: 'male' | 'female' | 'neutral';
      tone?: 'warm' | 'professional' | 'friendly' | 'energetic';
      formality?: 'casual' | 'formal';
    },
    options: Partial<TTSOptions> = {}
  ): Promise<TTSResult> {
    const voice = this.selectVoiceForPersonality(personality);

    // Adjust speed based on formality
    const speed = options.speed ?? (personality.formality === 'formal' ? 0.95 : 1.0);

    return this.synthesize(text, {
      ...options,
      voice,
      speed,
    });
  }

  /**
   * Batch synthesis for multiple text segments
   * Useful for pre-generating common phrases
   */
  async synthesizeBatch(texts: string[], options: TTSOptions = {}): Promise<TTSResult[]> {
    const results = await Promise.all(texts.map(text => this.synthesize(text, options)));
    return results;
  }

  /**
   * Select optimal voice based on character personality
   */
  private selectVoiceForPersonality(personality: {
    gender?: 'male' | 'female' | 'neutral';
    tone?: string;
  }): TTSVoice {
    const { gender, tone } = personality;

    // Male voices
    if (gender === 'male') {
      return tone === 'warm' ? 'echo' : 'onyx';
    }

    // Female voices
    if (gender === 'female') {
      return tone === 'energetic' ? 'nova' : 'shimmer';
    }

    // Neutral/default
    return 'alloy';
  }

  /**
   * Validate TTS input
   */
  private validateInput(text: string, speed: number): void {
    const maxLength = 4096; // OpenAI TTS limit

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > maxLength) {
      throw new Error(
        `Text exceeds maximum length of ${maxLength} characters (current: ${text.length})`
      );
    }

    if (speed < 0.25 || speed > 4.0) {
      throw new Error('Speed must be between 0.25 and 4.0');
    }
  }

  /**
   * Estimate audio duration based on text length and speed
   * Average: ~150 words per minute for English, ~300 characters per minute for Japanese
   */
  private estimateDuration(text: string, speed: number): number {
    // Rough estimate: 300 Japanese characters per minute at 1.0 speed
    const baseCharsPerMinute = 300;
    const adjustedCharsPerMinute = baseCharsPerMinute * speed;
    const durationMinutes = text.length / adjustedCharsPerMinute;
    return Math.ceil(durationMinutes * 60); // Convert to seconds
  }

  /**
   * Get estimated cost for TTS generation
   * OpenAI pricing: $15.00 per 1M characters
   */
  getEstimatedCost(characterCount: number): number {
    return (characterCount / 1_000_000) * 15.0;
  }

  /**
   * Get voice recommendations for Japanese learning
   */
  getRecommendedVoices(): TTSVoice[] {
    return Object.entries(this.voiceProfiles)
      .filter(([, profile]) => profile.recommended)
      .map(([voice]) => voice as TTSVoice);
  }

  /**
   * Get voice profile information
   */
  getVoiceProfile(voice: TTSVoice) {
    return this.voiceProfiles[voice];
  }
}

// Export singleton instance
export const ttsService = new TTSService();
export default ttsService;

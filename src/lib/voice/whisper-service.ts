// Whisper Speech-to-Text Service
import getOpenAIClient, { MODELS } from '@/lib/ai/openai-client';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string; // Context hint for better accuracy
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avgLogprob: number;
  compressionRatio: number;
  noSpeechProb: number;
}

export class WhisperService {
  private client = getOpenAIClient();

  /**
   * Transcribe audio file to text using Whisper API
   * Optimized for Japanese language learning with context awareness
   */
  async transcribe(
    audioFile: File | Buffer,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    try {
      const { language = 'ja', prompt, temperature = 0, responseFormat = 'verbose_json' } = options;

      // Ensure we have a File object for the API
      const file =
        audioFile instanceof Buffer
          ? new File([new Uint8Array(audioFile)], 'audio.webm', { type: 'audio/webm' })
          : audioFile;

      const response = await this.client.audio.transcriptions.create({
        file: file as File,
        model: MODELS.WHISPER,
        language,
        prompt,
        temperature,
        response_format: responseFormat,
      });

      // Handle different response formats
      if (typeof response === 'string') {
        return { text: response };
      }

      return {
        text: response.text,
        language: language,
        duration: (response as unknown as { duration?: number }).duration,
        segments: (response as unknown as { segments?: TranscriptionSegment[] }).segments,
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Transcribe with Japanese-specific optimizations
   * Includes context hints for better accuracy in learning scenarios
   */
  async transcribeJapanese(
    audioFile: File | Buffer,
    context?: {
      taskScenario?: string;
      expectedPhrases?: string[];
      userLevel?: string;
    }
  ): Promise<TranscriptionResult> {
    // Build context prompt for better accuracy
    let prompt = 'Japanese conversation. ';

    if (context?.taskScenario) {
      prompt += `Context: ${context.taskScenario}. `;
    }

    if (context?.expectedPhrases && context.expectedPhrases.length > 0) {
      prompt += `Expected phrases: ${context.expectedPhrases.join(', ')}. `;
    }

    return this.transcribe(audioFile, {
      language: 'ja',
      prompt: prompt.trim(),
      temperature: 0, // Deterministic for language learning
      responseFormat: 'verbose_json',
    });
  }

  /**
   * Validate audio file before transcription
   */
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    const allowedTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'audio/mp4',
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds 25MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    if (
      !allowedTypes.includes(file.type) &&
      !allowedTypes.some(type => file.name.endsWith(type.split('/')[1]))
    ) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get estimated transcription cost (based on OpenAI pricing)
   */
  getEstimatedCost(durationSeconds: number): number {
    // OpenAI pricing: $0.006 per minute
    const minutes = durationSeconds / 60;
    return minutes * 0.006;
  }
}

// Export singleton instance
export const whisperService = new WhisperService();
export default whisperService;

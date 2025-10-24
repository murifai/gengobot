// Task-based voice conversation service
// Phase 3.3: Voice Interaction System

import { whisperService } from './whisper-service';
import { ttsService } from './tts-service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Voice interaction metadata for task conversations
 */
export interface VoiceInteractionMetadata {
  transcriptionConfidence?: number;
  audioDuration: number;
  voiceActivityDetected: boolean;
  silenceDuration?: number;
  errorOccurred?: boolean;
  errorMessage?: string;
  retryCount?: number;
}

/**
 * Voice-enabled message for task conversations
 */
export interface VoiceMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  voiceMetadata?: VoiceInteractionMetadata;
  audioUrl?: string; // For TTS responses
  metadata?: {
    objectiveCompleted?: string;
    hintProvided?: boolean;
    correctionMade?: boolean;
  };
}

/**
 * Task voice conversation configuration
 */
export interface TaskVoiceConfig {
  userLevel: string; // N1-N5 JLPT level
  enableVoiceActivity: boolean;
  autoStopOnSilence: boolean;
  silenceDuration: number; // milliseconds
  maxRecordingDuration: number; // milliseconds
  voiceGuidance: boolean;
  audioFeedback: boolean;
  voicePersonality?: {
    voice: 'nova' | 'echo' | 'shimmer' | 'onyx' | 'fable' | 'alloy';
    speed: number;
  };
}

/**
 * Voice transcription result for task conversations
 */
export interface TaskVoiceTranscription {
  success: boolean;
  transcript: string;
  confidence?: number;
  duration: number;
  error?: string;
  suggestions?: string[]; // Language hints based on task context
}

/**
 * Voice synthesis result for task responses
 */
export interface TaskVoiceSynthesis {
  success: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

/**
 * Task-based voice conversation service
 * Integrates voice processing with task-based learning
 */
export class TaskVoiceService {
  private defaultConfig: TaskVoiceConfig = {
    userLevel: 'N5',
    enableVoiceActivity: true,
    autoStopOnSilence: true,
    silenceDuration: 2000,
    maxRecordingDuration: 60000,
    voiceGuidance: true,
    audioFeedback: true,
  };

  /**
   * Transcribe user voice input
   */
  async transcribeAudio(audioFile: File): Promise<TaskVoiceTranscription> {
    try {
      // Transcribe with Japanese optimization
      const result = await whisperService.transcribeJapanese(audioFile, {});

      return {
        success: true,
        transcript: result.text,
        confidence: undefined, // Whisper doesn't provide confidence scores
        duration: result.duration || 0,
      };
    } catch (error) {
      console.error('Task voice transcription error:', error);
      return {
        success: false,
        transcript: '',
        duration: 0,
        error: error instanceof Error ? error.message : 'Transcription failed',
      };
    }
  }

  /**
   * Synthesize AI response with task-appropriate voice
   */
  async synthesizeResponse(
    text: string,
    character: { personality?: unknown } | null,
    userProficiency: string
  ): Promise<TaskVoiceSynthesis> {
    try {
      // Use character personality if available
      let result;

      if (character?.personality) {
        const personality = character.personality as {
          gender?: 'male' | 'female' | 'neutral';
          tone?: 'warm' | 'professional' | 'friendly' | 'energetic';
          formality?: 'casual' | 'formal';
        };

        result = await ttsService.synthesizeWithPersonality(text, personality);
      } else {
        // Use learning-optimized synthesis
        result = await ttsService.synthesizeForLearning(
          text,
          userProficiency as 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
        );
      }

      // Save audio file to public directory
      const filename = `response-${Date.now()}.mp3`;
      const publicDir = join(process.cwd(), 'public', 'audio');
      const filepath = join(publicDir, filename);

      // Ensure directory exists
      if (!existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true });
      }

      await writeFile(filepath, result.audio);

      // Return public URL
      const audioUrl = `/audio/${filename}`;

      // Also create blob for compatibility
      const audioBlob = new Blob([new Uint8Array(result.audio)], { type: 'audio/mpeg' });

      return {
        success: true,
        audioBlob,
        audioUrl,
        duration: (result as { duration?: number }).duration,
      };
    } catch (error) {
      console.error('Task voice synthesis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Synthesis failed',
      };
    }
  }

  /**
   * Validate voice recording quality
   */
  validateRecording(metadata: VoiceInteractionMetadata): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let isValid = true;

    console.log('Validating recording with metadata:', metadata);

    // Check minimum duration (at least 0.3 seconds - reduced from 0.5 for better UX)
    if (metadata.audioDuration < 300) {
      warnings.push('Recording too short - please speak for at least 0.3 seconds');
      isValid = false;
    }

    // Check if voice was detected
    if (!metadata.voiceActivityDetected) {
      warnings.push('No voice detected - please check your microphone and try speaking louder');
      isValid = false;
    }

    // Check for errors
    if (metadata.errorOccurred) {
      warnings.push(metadata.errorMessage || 'Recording error occurred');
      isValid = false;
    }

    // Check retry count (warning only, not blocking)
    if (metadata.retryCount && metadata.retryCount > 3) {
      warnings.push('Multiple recording attempts - consider checking audio settings');
    }

    console.log('Validation result:', { isValid, warnings });

    return { isValid, warnings };
  }
}

// Export singleton instance
export const taskVoiceService = new TaskVoiceService();

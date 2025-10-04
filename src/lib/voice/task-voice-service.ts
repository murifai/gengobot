// Task-based voice conversation service
// Phase 3.3: Voice Interaction System

import { whisperService } from './whisper-service';
import { ttsService } from './tts-service';
import type { TaskConversationContext, GuidanceResponse } from '../tasks/conversation-guidance';
import {
  evaluateConversationProgress,
  generateTaskSystemPrompt,
} from '../tasks/conversation-guidance';

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
   * Transcribe user voice input with task context
   */
  async transcribeTaskInput(
    audioBlob: Blob,
    context: TaskConversationContext,
    config?: Partial<TaskVoiceConfig>
  ): Promise<TaskVoiceTranscription> {
    try {
      const taskConfig = { ...this.defaultConfig, ...config };

      // Build context for better transcription accuracy
      const taskScenario = context.scenario;
      const learningObjectives = context.learningObjectives;
      const currentObjective = learningObjectives[context.currentObjective];

      // Extract expected phrases from objectives and scenario
      const expectedPhrases = this.extractExpectedPhrases(
        context.scenario,
        context.learningObjectives,
        context.category
      );

      // Convert Blob to File for Whisper service
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: audioBlob.type || 'audio/webm',
      });

      // Transcribe with Japanese optimization
      const result = await whisperService.transcribeJapanese(audioFile, {
        taskScenario,
        expectedPhrases,
        userLevel: taskConfig.userLevel,
      });

      // Generate language hints based on task context
      const suggestions = this.generateLanguageHints(
        result.text,
        currentObjective,
        context.difficulty
      );

      return {
        success: true,
        transcript: result.text,
        confidence: undefined, // Whisper doesn't provide confidence scores
        duration: result.duration || 0,
        suggestions,
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
  async synthesizeTaskResponse(
    text: string,
    context: TaskConversationContext,
    config?: Partial<TaskVoiceConfig>
  ): Promise<TaskVoiceSynthesis> {
    try {
      const taskConfig = { ...this.defaultConfig, ...config };

      // Use character personality if available
      if (context.characterPersonality) {
        const personality = context.characterPersonality as {
          gender?: 'male' | 'female' | 'neutral';
          tone?: 'warm' | 'professional' | 'friendly' | 'energetic';
          formality?: 'casual' | 'formal';
        };

        const result = await ttsService.synthesizeWithPersonality(text, personality);

        // Convert Buffer to Blob using Uint8Array
        const audioBlob = new Blob([new Uint8Array(result.audio)], { type: 'audio/mpeg' });

        return {
          success: true,
          audioBlob,
          audioUrl: URL.createObjectURL(audioBlob),
        };
      }

      // Use learning-optimized synthesis
      const result = await ttsService.synthesizeForLearning(
        text,
        (context.userProficiency || taskConfig.userLevel) as 'N5' | 'N4' | 'N3' | 'N2' | 'N1',
        {
          ...(taskConfig.voicePersonality?.voice && { voice: taskConfig.voicePersonality.voice }),
          ...(taskConfig.voicePersonality?.speed && { speed: taskConfig.voicePersonality.speed }),
        }
      );

      // Convert Buffer to Blob using Uint8Array
      const audioBlob = new Blob([new Uint8Array(result.audio)], { type: 'audio/mpeg' });

      return {
        success: true,
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
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
   * Generate audio feedback for task progress
   */
  async generateProgressFeedback(
    guidance: GuidanceResponse,
    context: TaskConversationContext,
    config?: Partial<TaskVoiceConfig>
  ): Promise<TaskVoiceSynthesis> {
    const taskConfig = { ...this.defaultConfig, ...config };

    if (!taskConfig.audioFeedback) {
      return { success: false, error: 'Audio feedback disabled' };
    }

    let feedbackText = '';

    switch (guidance.guidanceType) {
      case 'encouragement':
        feedbackText = guidance.message || 'よくできました！ Keep going!';
        break;
      case 'hint':
        feedbackText = guidance.message || 'ヒント: Try to focus on the current objective.';
        break;
      case 'progression':
        feedbackText = guidance.message || '次の目標に進みましょう！';
        break;
      default:
        return { success: false, error: 'No feedback needed' };
    }

    return this.synthesizeTaskResponse(feedbackText, context, config);
  }

  /**
   * Generate audio guidance for task objectives
   */
  async generateObjectiveGuidance(
    objective: string,
    context: TaskConversationContext,
    config?: Partial<TaskVoiceConfig>
  ): Promise<TaskVoiceSynthesis> {
    const taskConfig = { ...this.defaultConfig, ...config };

    if (!taskConfig.voiceGuidance) {
      return { success: false, error: 'Voice guidance disabled' };
    }

    const guidanceText = `目標: ${objective}`;
    return this.synthesizeTaskResponse(guidanceText, context, config);
  }

  /**
   * Extract expected phrases from task context
   */
  private extractExpectedPhrases(
    scenario: string,
    objectives: string[],
    category: string
  ): string[] {
    const phrases: string[] = [];

    // Category-specific common phrases
    const categoryPhrases: Record<string, string[]> = {
      'Restaurant & Food Service': ['いらっしゃいませ', 'ご注文は', 'お願いします', 'ください'],
      'Shopping & Commerce': ['いくらですか', 'これください', '見せてください'],
      'Travel & Transportation': ['どこですか', '行きたい', 'ください'],
      'Business & Professional': ['よろしくお願いします', '申し訳ございません'],
      'Healthcare & Medical': ['具合が悪い', '痛いです', 'お願いします'],
    };

    if (categoryPhrases[category]) {
      phrases.push(...categoryPhrases[category]);
    }

    // Extract key phrases from objectives (simplified)
    objectives.forEach(objective => {
      // Extract Japanese text from objectives
      const japaneseMatches = objective.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g);
      if (japaneseMatches) {
        phrases.push(...japaneseMatches);
      }
    });

    return [...new Set(phrases)]; // Remove duplicates
  }

  /**
   * Generate language hints based on transcription
   */
  private generateLanguageHints(
    transcript: string,
    objective: string,
    difficulty: string
  ): string[] {
    const hints: string[] = [];

    // Check if transcript is empty or very short
    if (!transcript || transcript.length < 3) {
      hints.push('Try speaking more clearly or closer to the microphone');
      return hints;
    }

    // Check Japanese usage
    const japaneseChars = transcript.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
    const japaneseRatio = japaneseChars ? japaneseChars.length / transcript.length : 0;

    if (japaneseRatio < 0.5) {
      hints.push('Try using more Japanese in your response');
    }

    // Difficulty-specific hints
    if (difficulty === 'N5' && transcript.length > 100) {
      hints.push('For N5 level, simpler and shorter responses are better');
    }

    if (difficulty === 'N1' && transcript.length < 30) {
      hints.push('Try to provide more detailed responses at N1 level');
    }

    return hints;
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

    // Check minimum duration (at least 0.5 seconds)
    if (metadata.audioDuration < 500) {
      warnings.push('Recording too short - please speak for at least 0.5 seconds');
      isValid = false;
    }

    // Check if voice was detected
    if (!metadata.voiceActivityDetected) {
      warnings.push('No voice detected - please check your microphone');
      isValid = false;
    }

    // Check for errors
    if (metadata.errorOccurred) {
      warnings.push(metadata.errorMessage || 'Recording error occurred');
      isValid = false;
    }

    // Check retry count
    if (metadata.retryCount && metadata.retryCount > 3) {
      warnings.push('Multiple recording attempts - consider checking audio settings');
    }

    return { isValid, warnings };
  }
}

// Export singleton instance
export const taskVoiceService = new TaskVoiceService();

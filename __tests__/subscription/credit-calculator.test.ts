import { describe, it, expect } from '@jest/globals';
import { UsageType } from '@prisma/client';
import {
  calculateCreditsFromUsage,
  getUsageTypeFromModel,
  aggregateUsage,
  TokenUsage,
} from '@/lib/subscription/credit-calculator';
import { OPENAI_PRICING, CREDIT_CONVERSION_RATE } from '@/lib/subscription/credit-config';

describe('credit-calculator', () => {
  describe('calculateCreditsFromUsage', () => {
    describe('GPT-4o-mini (text chat and analysis)', () => {
      it('should calculate credits correctly for feedback generation', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 800,
          outputTokens: 200,
        });

        // Input: 800 * $0.15/1M = $0.00012
        // Output: 200 * $0.60/1M = $0.00012
        // Total: $0.00024 → 3 credits (rounded up)
        expect(result.credits).toBe(3);
        expect(result.usdCost).toBeCloseTo(0.00024, 7);
      });

      it('should calculate credits for hint generation', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 500,
          outputTokens: 100,
        });

        // Input: 500 * $0.15/1M = $0.000075
        // Output: 100 * $0.60/1M = $0.00006
        // Total: $0.000135 → 2 credits (rounded up)
        expect(result.credits).toBe(2);
      });
    });

    describe('Whisper (speech-to-text)', () => {
      it('should calculate credits for 10 seconds of audio', () => {
        const result = calculateCreditsFromUsage({
          model: 'whisper-1',
          audioDurationSeconds: 10,
        });

        // 10 sec = 0.167 min * $0.006/min = $0.001
        // → 10 credits
        expect(result.credits).toBe(10);
        expect(result.usdCost).toBeCloseTo(0.001, 7);
        expect(result.breakdown.audioDuration).toBeCloseTo(0.001, 7);
      });

      it('should calculate credits for 1 minute of audio', () => {
        const result = calculateCreditsFromUsage({
          model: 'whisper-1',
          audioDurationSeconds: 60,
        });

        // 60 sec = 1 min * $0.006/min = $0.006
        // → 60 credits
        expect(result.credits).toBe(60);
        expect(result.usdCost).toBeCloseTo(0.006, 7);
      });

      it('should calculate credits for 30 seconds of audio', () => {
        const result = calculateCreditsFromUsage({
          model: 'whisper-1',
          audioDurationSeconds: 30,
        });

        // 30 sec = 0.5 min * $0.006/min = $0.003
        // → 30 credits
        expect(result.credits).toBe(30);
        expect(result.usdCost).toBeCloseTo(0.003, 7);
      });
    });

    describe('TTS (text-to-speech)', () => {
      it('should calculate credits for TTS with characters and audio output', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini-tts',
          characterCount: 500,
          outputTokens: 1000, // audio tokens
        });

        // Chars: 500 * $0.60/1M = $0.0003
        // Audio: 1000 * $12/1M = $0.012
        // Total: $0.0123 → 123 credits
        expect(result.credits).toBe(123);
        expect(result.usdCost).toBeCloseTo(0.0123, 7);
        expect(result.breakdown.ttsInput).toBeCloseTo(0.0003, 7);
        expect(result.breakdown.ttsOutput).toBeCloseTo(0.012, 7);
      });

      it('should calculate credits for short TTS response', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini-tts',
          characterCount: 100,
          outputTokens: 200,
        });

        // Chars: 100 * $0.60/1M = $0.00006
        // Audio: 200 * $12/1M = $0.0024
        // Total: $0.00246 → 25 credits
        expect(result.credits).toBe(25);
      });
    });

    describe('Realtime API', () => {
      it('should calculate credits for realtime audio conversation', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-realtime-preview',
          audioInputTokens: 27000, // ~1 min of audio input (450 tokens/sec * 60 sec)
          audioOutputTokens: 27000, // ~1 min of audio output
        });

        // Audio input: 27000 / (450 * 60) = 1 min * $0.036/min = $0.036
        // Audio output: 27000 / (450 * 60) = 1 min * $0.091/min = $0.091
        // Total: $0.127 → 1270 credits
        expect(result.credits).toBe(1270);
        expect(result.usdCost).toBeCloseTo(0.127, 3);
      });

      it('should calculate credits for realtime with text tokens', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-realtime-preview',
          inputTokens: 1000, // text input (instructions)
          outputTokens: 500, // text output (transcription)
          audioInputTokens: 13500, // ~30 sec audio
          audioOutputTokens: 13500,
        });

        // Text input: 1000 * $0.60/1M = $0.0006
        // Text output: 500 * $2.40/1M = $0.0012
        // Audio input: 13500 / (450*60) = 0.5 min * $0.036 = $0.018
        // Audio output: 13500 / (450*60) = 0.5 min * $0.091 = $0.0455
        // Total: ~$0.0653 → 654 credits
        expect(result.credits).toBeGreaterThan(600);
        expect(result.credits).toBeLessThan(700);
      });

      it('should calculate credits for short realtime exchange', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-realtime-preview',
          audioInputTokens: 4500, // ~10 sec
          audioOutputTokens: 4500,
        });

        // Audio input: 4500 / (450*60) = 0.167 min * $0.036 = $0.006
        // Audio output: 4500 / (450*60) = 0.167 min * $0.091 = $0.0152
        // Total: ~$0.0212 → 212 credits
        expect(result.credits).toBeGreaterThan(200);
        expect(result.credits).toBeLessThan(230);
      });
    });

    describe('Edge cases', () => {
      it('should return 0 for unknown model', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = calculateCreditsFromUsage({
          model: 'unknown-model',
          inputTokens: 1000,
        });

        expect(result.credits).toBe(0);
        expect(result.usdCost).toBe(0);
        expect(result.breakdown).toEqual({});
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown model pricing: unknown-model')
        );

        consoleSpy.mockRestore();
      });

      it('should return 0 for zero tokens', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 0,
          outputTokens: 0,
        });

        expect(result.credits).toBe(0);
        expect(result.usdCost).toBe(0);
      });

      it('should handle undefined optional fields', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 100,
          // outputTokens is undefined
        });

        // Only input tokens counted: 100 * $0.15/1M = $0.000015 → 1 credit
        expect(result.credits).toBe(1);
        expect(result.breakdown.inputTokens).toBeDefined();
        expect(result.breakdown.outputTokens).toBeUndefined();
      });

      it('should round up to nearest credit', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 1, // Very small usage
          outputTokens: 1,
        });

        // Even tiny usage rounds up to 1 credit
        expect(result.credits).toBe(1);
      });

      it('should handle very large token counts', () => {
        const result = calculateCreditsFromUsage({
          model: 'gpt-4o-mini',
          inputTokens: 100000,
          outputTokens: 10000,
        });

        // Input: 100000 * $0.15/1M = $0.015
        // Output: 10000 * $0.60/1M = $0.006
        // Total: $0.021 → 210 credits
        expect(result.credits).toBe(210);
      });
    });
  });

  describe('getUsageTypeFromModel', () => {
    it('should return VOICE_STANDARD for whisper-1', () => {
      expect(getUsageTypeFromModel('whisper-1')).toBe(UsageType.VOICE_STANDARD);
    });

    it('should return VOICE_STANDARD for gpt-4o-mini-tts', () => {
      expect(getUsageTypeFromModel('gpt-4o-mini-tts')).toBe(UsageType.VOICE_STANDARD);
    });

    it('should return REALTIME for gpt-4o-realtime-preview', () => {
      expect(getUsageTypeFromModel('gpt-4o-realtime-preview')).toBe(UsageType.REALTIME);
    });

    it('should return TEXT_CHAT for gpt-4o-mini', () => {
      expect(getUsageTypeFromModel('gpt-4o-mini')).toBe(UsageType.TEXT_CHAT);
    });

    it('should return TEXT_CHAT for unknown models', () => {
      expect(getUsageTypeFromModel('unknown-model')).toBe(UsageType.TEXT_CHAT);
    });
  });

  describe('aggregateUsage', () => {
    it('should aggregate multiple text chat usages', () => {
      const usages: TokenUsage[] = [
        { model: 'gpt-4o-mini', inputTokens: 1000, outputTokens: 100 },
        { model: 'gpt-4o-mini', inputTokens: 500, outputTokens: 200 },
      ];

      const result = aggregateUsage(usages);

      // First: 1000 * 0.15/1M + 100 * 0.6/1M = $0.00021 → 3 credits
      // Second: 500 * 0.15/1M + 200 * 0.6/1M = $0.000195 → 2 credits
      // Total: 5 credits
      expect(result.credits).toBe(5);
      expect(Object.keys(result.breakdown)).toContain('gpt-4o-mini_inputTokens');
      expect(Object.keys(result.breakdown)).toContain('gpt-4o-mini_outputTokens');
    });

    it('should aggregate voice chat flow (Whisper + LLM + TTS)', () => {
      const usages: TokenUsage[] = [
        // Whisper transcription (10 seconds)
        { model: 'whisper-1', audioDurationSeconds: 10 },
        // LLM response generation
        { model: 'gpt-4o-mini', inputTokens: 2000, outputTokens: 150 },
        // TTS synthesis
        { model: 'gpt-4o-mini-tts', characterCount: 300, outputTokens: 600 },
      ];

      const result = aggregateUsage(usages);

      // Whisper: 10/60 * $0.006 = $0.001 → 10 credits
      // GPT-4o-mini: 2000 * 0.15/1M + 150 * 0.6/1M = $0.00039 → 4 credits
      // TTS: 300 * 0.6/1M + 600 * 12/1M = $0.00738 → 74 credits
      // Total: ~88 credits
      expect(result.credits).toBeGreaterThan(80);
      expect(result.credits).toBeLessThan(100);
    });

    it('should handle empty array', () => {
      const result = aggregateUsage([]);

      expect(result.credits).toBe(0);
      expect(result.usdCost).toBe(0);
      expect(result.breakdown).toEqual({});
    });

    it('should handle single usage', () => {
      const usages: TokenUsage[] = [{ model: 'gpt-4o-mini', inputTokens: 1000, outputTokens: 100 }];

      const result = aggregateUsage(usages);
      const single = calculateCreditsFromUsage(usages[0]);

      expect(result.credits).toBe(single.credits);
      expect(result.usdCost).toBeCloseTo(single.usdCost, 7);
    });

    it('should aggregate realtime session with multiple exchanges', () => {
      const usages: TokenUsage[] = [
        // First exchange
        { model: 'gpt-4o-realtime-preview', audioInputTokens: 4500, audioOutputTokens: 4500 },
        // Second exchange
        { model: 'gpt-4o-realtime-preview', audioInputTokens: 9000, audioOutputTokens: 6750 },
        // Third exchange
        { model: 'gpt-4o-realtime-preview', audioInputTokens: 2250, audioOutputTokens: 4500 },
      ];

      const result = aggregateUsage(usages);

      // Should be sum of all exchanges
      let expectedCredits = 0;
      for (const usage of usages) {
        expectedCredits += calculateCreditsFromUsage(usage).credits;
      }

      expect(result.credits).toBe(expectedCredits);
    });
  });

  describe('Pricing constants verification', () => {
    it('should have correct CREDIT_CONVERSION_RATE', () => {
      expect(CREDIT_CONVERSION_RATE).toBe(0.0001);
    });

    it('should have all expected models in OPENAI_PRICING', () => {
      expect(OPENAI_PRICING).toHaveProperty('gpt-4o-mini');
      expect(OPENAI_PRICING).toHaveProperty('whisper-1');
      expect(OPENAI_PRICING).toHaveProperty('gpt-4o-mini-tts');
      expect(OPENAI_PRICING).toHaveProperty('gpt-4o-realtime-preview');
    });

    it('should have correct GPT-4o-mini pricing', () => {
      const pricing = OPENAI_PRICING['gpt-4o-mini'];
      expect(pricing.input).toBeCloseTo(0.15 / 1_000_000, 15);
      expect(pricing.output).toBeCloseTo(0.6 / 1_000_000, 15);
    });

    it('should have correct Whisper pricing', () => {
      const pricing = OPENAI_PRICING['whisper-1'];
      expect(pricing.perMinute).toBe(0.006);
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should calculate typical task-based chat session', () => {
      // Typical task: 5 exchanges with feedback
      const usages: TokenUsage[] = [];

      // 5 user-AI exchanges (response model)
      for (let i = 0; i < 5; i++) {
        usages.push({
          model: 'gpt-4o-mini',
          inputTokens: 2000 + i * 500, // Growing context
          outputTokens: 150,
        });
      }

      // Feedback at the end (analysis model)
      usages.push({
        model: 'gpt-4o-mini',
        inputTokens: 3000,
        outputTokens: 500,
      });

      const result = aggregateUsage(usages);

      // Should be reasonable for a task session (higher with gpt-4o-mini pricing)
      expect(result.credits).toBeGreaterThan(15);
      expect(result.credits).toBeLessThan(50);
    });

    it('should calculate 5-minute voice conversation', () => {
      const exchanges = 10; // ~30 sec per exchange
      const usages: TokenUsage[] = [];

      for (let i = 0; i < exchanges; i++) {
        // Whisper (15 sec user audio)
        usages.push({ model: 'whisper-1', audioDurationSeconds: 15 });
        // LLM response
        usages.push({
          model: 'gpt-4o-mini',
          inputTokens: 1500 + i * 200,
          outputTokens: 100,
        });
        // TTS (15 sec response)
        usages.push({
          model: 'gpt-4o-mini-tts',
          characterCount: 200,
          outputTokens: 400,
        });
      }

      const result = aggregateUsage(usages);

      // 5 min voice should use significant credits
      expect(result.credits).toBeGreaterThan(400);
      expect(result.credits).toBeLessThan(800);
    });

    it('should calculate 1-minute realtime session', () => {
      const result = calculateCreditsFromUsage({
        model: 'gpt-4o-realtime-preview',
        audioInputTokens: 27000, // 1 min
        audioOutputTokens: 27000, // 1 min
        inputTokens: 500, // system prompt
      });

      // Should be around 1270 credits for 1 min each way
      expect(result.credits).toBeGreaterThan(1200);
      expect(result.credits).toBeLessThan(1400);
    });
  });
});

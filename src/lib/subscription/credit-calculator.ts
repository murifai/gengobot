import { UsageType } from '@prisma/client';
import { OPENAI_PRICING, CREDIT_CONVERSION_RATE } from './credit-config';

/**
 * Token usage data from OpenAI API responses
 */
export interface TokenUsage {
  /** The model used for the API call */
  model: string;
  /** Number of input/prompt tokens (for text models) */
  inputTokens?: number;
  /** Number of output/completion tokens (for text models) */
  outputTokens?: number;
  /** Audio duration in seconds (for Whisper) */
  audioDurationSeconds?: number;
  /** Number of audio input tokens (for Realtime API) */
  audioInputTokens?: number;
  /** Number of audio output tokens (for Realtime API) */
  audioOutputTokens?: number;
  /** Character count (for TTS input) */
  characterCount?: number;
}

/**
 * Result of credit calculation
 */
export interface CreditCalculationResult {
  /** Total credits to deduct (rounded up from USD cost) */
  credits: number;
  /** Total cost in USD */
  usdCost: number;
  /** Breakdown of costs by component */
  breakdown: Record<string, number>;
}

/**
 * Calculate credits based on actual API usage
 *
 * This function converts actual OpenAI API token/duration usage
 * into credits using the formula: credits = USD_cost / 0.0001
 *
 * @param usage - Token usage data from API response
 * @returns Credits to deduct, USD cost, and cost breakdown
 *
 * @example
 * // Text chat with GPT-4o-mini
 * const result = calculateCreditsFromUsage({
 *   model: 'gpt-4o-mini',
 *   inputTokens: 3050,
 *   outputTokens: 150,
 * });
 * // result.credits ≈ 6
 *
 * @example
 * // Whisper transcription
 * const result = calculateCreditsFromUsage({
 *   model: 'whisper-1',
 *   audioDurationSeconds: 10,
 * });
 * // result.credits ≈ 10
 */
export function calculateCreditsFromUsage(usage: TokenUsage): CreditCalculationResult {
  let totalUsdCost = 0;
  const breakdown: Record<string, number> = {};

  const pricing = OPENAI_PRICING[usage.model as keyof typeof OPENAI_PRICING];

  if (!pricing) {
    console.warn(`[CreditCalculator] Unknown model pricing: ${usage.model}`);
    return { credits: 0, usdCost: 0, breakdown };
  }

  // Text tokens (GPT models: gpt-5-nano, gpt-4o-mini)
  if ('input' in pricing && usage.inputTokens) {
    const inputCost = usage.inputTokens * pricing.input;
    totalUsdCost += inputCost;
    breakdown.inputTokens = inputCost;
  }
  if ('output' in pricing && usage.outputTokens) {
    const outputCost = usage.outputTokens * pricing.output;
    totalUsdCost += outputCost;
    breakdown.outputTokens = outputCost;
  }

  // Whisper (audio duration in seconds)
  if ('perMinute' in pricing && usage.audioDurationSeconds) {
    const minutes = usage.audioDurationSeconds / 60;
    const audioCost = minutes * pricing.perMinute;
    totalUsdCost += audioCost;
    breakdown.audioDuration = audioCost;
  }

  // TTS (characters + audio tokens)
  if ('inputPerChar' in pricing) {
    if (usage.characterCount) {
      const charCost = usage.characterCount * pricing.inputPerChar;
      totalUsdCost += charCost;
      breakdown.ttsInput = charCost;
    }
    if (usage.outputTokens) {
      const audioTokenCost = usage.outputTokens * pricing.outputPerToken;
      totalUsdCost += audioTokenCost;
      breakdown.ttsOutput = audioTokenCost;
    }
  }

  // Realtime API (audio tokens + text tokens)
  if ('audioInputPerMin' in pricing) {
    // Audio input tokens (user speaking)
    // ~450 tokens per second of audio
    if (usage.audioInputTokens) {
      const inputMinutes = usage.audioInputTokens / (450 * 60);
      const inputCost = inputMinutes * pricing.audioInputPerMin;
      totalUsdCost += inputCost;
      breakdown.realtimeAudioInput = inputCost;
    }

    // Audio output tokens (AI response)
    if (usage.audioOutputTokens) {
      const outputMinutes = usage.audioOutputTokens / (450 * 60);
      const outputCost = outputMinutes * pricing.audioOutputPerMin;
      totalUsdCost += outputCost;
      breakdown.realtimeAudioOutput = outputCost;
    }

    // Text input tokens (instructions, context)
    if (usage.inputTokens) {
      const textInputCost = usage.inputTokens * pricing.textInput;
      totalUsdCost += textInputCost;
      breakdown.realtimeTextInput = textInputCost;
    }

    // Text output tokens (transcription, etc.)
    if (usage.outputTokens) {
      const textOutputCost = usage.outputTokens * pricing.textOutput;
      totalUsdCost += textOutputCost;
      breakdown.realtimeTextOutput = textOutputCost;
    }
  }

  // Convert USD to credits (round up to ensure we always cover costs)
  const credits = Math.ceil(totalUsdCost / CREDIT_CONVERSION_RATE);

  return { credits, usdCost: totalUsdCost, breakdown };
}

/**
 * Map model name to UsageType enum
 *
 * @param model - OpenAI model name
 * @returns Corresponding UsageType or TEXT_CHAT as default
 */
export function getUsageTypeFromModel(model: string): UsageType {
  switch (model) {
    case 'whisper-1':
    case 'gpt-4o-mini-tts':
      return UsageType.VOICE_STANDARD;
    case 'gpt-4o-realtime-preview':
      return UsageType.REALTIME;
    case 'gpt-4o-mini':
    default:
      return UsageType.TEXT_CHAT;
  }
}

/**
 * Aggregate multiple usage records into a single credit calculation
 *
 * Useful when a single user action involves multiple API calls
 * (e.g., chat + feedback + hint generation)
 *
 * @param usages - Array of token usage records
 * @returns Aggregated credit calculation
 *
 * @example
 * // Task chat with feedback
 * const result = aggregateUsage([
 *   { model: 'gpt-5-nano', inputTokens: 3050, outputTokens: 150 },
 *   { model: 'gpt-4o-mini', inputTokens: 800, outputTokens: 200 },
 * ]);
 */
export function aggregateUsage(usages: TokenUsage[]): CreditCalculationResult {
  let totalCredits = 0;
  let totalUsdCost = 0;
  const aggregatedBreakdown: Record<string, number> = {};

  for (const usage of usages) {
    const result = calculateCreditsFromUsage(usage);
    totalCredits += result.credits;
    totalUsdCost += result.usdCost;

    // Merge breakdowns
    for (const [key, value] of Object.entries(result.breakdown)) {
      const prefixedKey = `${usage.model}_${key}`;
      aggregatedBreakdown[prefixedKey] = (aggregatedBreakdown[prefixedKey] || 0) + value;
    }
  }

  return {
    credits: totalCredits,
    usdCost: totalUsdCost,
    breakdown: aggregatedBreakdown,
  };
}

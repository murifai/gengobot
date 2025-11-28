/**
 * Active Time Calculation Utility
 * Calculates actual active conversation time based on message timestamps
 * instead of simple start-to-end duration (which includes AFK time)
 */

export interface Message {
  role: string;
  content: string;
  timestamp: string;
}

export interface ConversationHistory {
  messages?: Message[];
  startedAt?: string;
  completedObjectives?: string[];
}

/**
 * Calculate active minutes from conversation history
 * Only counts time gaps between messages that are <= MAX_GAP_MINUTES
 * This excludes AFK/idle time from the total
 *
 * @param conversationHistory - The conversation history object or messages array
 * @param maxGapMinutes - Maximum gap in minutes to consider as "active" (default: 5)
 * @returns Active minutes spent in conversation
 */
export function calculateActiveMinutes(
  conversationHistory: ConversationHistory | Message[],
  maxGapMinutes: number = 5
): number {
  // Handle both array and object formats
  const messages = Array.isArray(conversationHistory)
    ? conversationHistory
    : conversationHistory?.messages || [];

  if (messages.length < 2) {
    // With 0 or 1 messages, we can't calculate gaps
    // Return 1 minute as minimum if there's at least one message
    return messages.length > 0 ? 1 : 0;
  }

  let activeMinutes = 0;

  for (let i = 1; i < messages.length; i++) {
    const currentTime = new Date(messages[i].timestamp).getTime();
    const previousTime = new Date(messages[i - 1].timestamp).getTime();

    // Calculate gap in minutes
    const gapMinutes = (currentTime - previousTime) / (1000 * 60);

    // Only count if gap is within active threshold
    if (gapMinutes <= maxGapMinutes && gapMinutes >= 0) {
      activeMinutes += gapMinutes;
    }
  }

  // Round to nearest integer, minimum 1 minute if there was any activity
  return Math.max(1, Math.round(activeMinutes));
}

/**
 * Calculate active minutes for FreeConversation (Kaiwa Bebas)
 * Uses the same logic but handles the FreeConversation data structure
 *
 * @param conversationHistory - JSON data from FreeConversation.conversationHistory
 * @param maxGapMinutes - Maximum gap in minutes to consider as "active" (default: 5)
 * @returns Active minutes spent in conversation
 */
export function calculateFreeConversationActiveMinutes(
  conversationHistory: { messages?: Message[]; startedAt?: string },
  maxGapMinutes: number = 5
): number {
  return calculateActiveMinutes(conversationHistory, maxGapMinutes);
}

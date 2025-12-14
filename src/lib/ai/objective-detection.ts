// AI-powered objective detection and simplified assessment for task-based learning
import { Task } from '@prisma/client';

export interface ObjectiveTracking {
  objectiveId: string;
  objectiveText: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  completedAtMessageIndex?: number;
  confidence: number;
  evidence: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate AI prompt for detecting objective completion in conversation
 */
export function generateObjectiveDetectionPrompt(
  task: Task,
  conversationHistory: Message[],
  currentObjectives: ObjectiveTracking[]
): string {
  const objectives = task.learningObjectives as string[];

  return `You are evaluating a Japanese language learning conversation to detect if learning objectives have been completed BY THE USER.

# Task Information
- Title: ${task.title}
- Scenario: ${task.scenario}
- JLPT Level: ${task.difficulty}

# Learning Objectives to Detect:
${objectives.map((obj, i) => `${i}. ${obj} [Status: ${currentObjectives[i]?.status || 'pending'}]`).join('\n')}

# Recent Conversation:
${conversationHistory
  .slice(-8)
  .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join('\n')}

# CRITICAL: Only Count USER Messages
IMPORTANT: You MUST only evaluate USER messages when determining objective completion.
- ASSISTANT/AI messages do NOT count as completion
- The USER must personally demonstrate, attempt, or discuss the objective
- If only the AI mentioned/explained a topic but the user never engaged with it, mark as PENDING

# Your Task:
For EACH learning objective, determine:
1. Has it been completed BY THE USER in the conversation? (yes/no)
2. Confidence score (0-100)
3. Evidence (only cite USER messages as evidence of completion)

# Detection Guidelines (BE LENIENT - BUT ONLY FOR USER ACTIONS):
- Mark as completed if the USER DISCUSSED, ATTEMPTED, or DEMONSTRATED the objective topic
- The user does NOT need to perfectly execute - attempts and discussions count
- If the USER's messages relate to the objective, consider it completed
- Examples of USER completion:
  * User asked about or mentioned the topic → completed (confidence 70-85)
  * User attempted to use relevant vocabulary/grammar → completed (confidence 80-90)
  * User successfully demonstrated the skill → completed (confidence 90-100)
  * User responded to AI's question about the topic → completed (confidence 75-85)
- Examples that DO NOT count as completion:
  * AI explained the topic but user never responded about it → PENDING
  * AI demonstrated vocabulary/grammar but user didn't use it → PENDING
  * AI asked about topic but user's response was unrelated → PENDING
- Only mark as pending if the USER never engaged with the topic
- Give benefit of doubt to the learner - but the learner MUST have participated

Important:
- Be generous in detection - but ONLY for USER messages
- Consider partial attempts by the USER as progress toward completion
- If uncertain whether USER engaged, lean toward marking as completed with lower confidence (60-75)
- Focus on whether the USER engaged with the learning topic, not the AI

Response Format (JSON):
{
  "objectives": [
    {
      "objectiveId": "0",
      "objectiveText": "...",
      "status": "completed" | "pending",
      "confidence": 85,
      "evidence": ["User: ...", "AI confirmed: ..."],
      "completedAtMessageIndex": 12
    }
  ],
  "allCompleted": false,
  "overallConfidence": 78
}`;
}

/**
 * Generate AI prompt for simplified assessment feedback
 */
export function generateSimplifiedAssessmentPrompt(
  task: Task,
  conversationHistory: Message[],
  objectiveStatus: ObjectiveTracking[]
): string {
  return `You are providing feedback for a Japanese language learning task completion.

# Task Details
- Title: ${task.title}
- Scenario: ${task.scenario}
- JLPT Level: ${task.difficulty}

# Learning Objectives & Achievement:
${objectiveStatus.map((obj, i) => `${i + 1}. ${obj.objectiveText} - ${obj.status === 'completed' ? '✓ ACHIEVED' : '✗ NOT ACHIEVED'}`).join('\n')}

# Complete Conversation:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

# Your Task:
Provide constructive feedback on the learner's conversation performance.

Focus on:
1. What they did well (strengths)
2. What they can improve (specific, actionable advice)
3. Overall assessment of their communication
4. Encouragement and next steps

Be supportive, specific, and educational. Reference actual messages when possible.

Response Format (JSON):
{
  "conversationFeedback": {
    "strengths": [
      "Successfully used polite expressions like 'お願いします'",
      "Clear and natural question formation",
      "Good use of appropriate vocabulary for the situation"
    ],
    "areasToImprove": [
      "Could use more varied sentence structures",
      "Try incorporating more conjunctions like 'それから' to connect ideas",
      "Practice using past tense forms more consistently"
    ],
    "overallFeedback": "You demonstrated good understanding of the restaurant scenario and successfully communicated your needs. Your use of polite language was appropriate, though there's room to expand your vocabulary range. Keep practicing natural conversation flow.",
    "encouragement": "Great job completing this task! You're making solid progress in practical Japanese conversation. Keep up the good work!"
  },
  "nextSteps": [
    "Practice similar restaurant scenarios to build confidence",
    "Try more complex ordering situations with multiple items",
    "Review particles (は, が, を) for more natural speech"
  ],
  "suggestRetry": false
}`;
}

/**
 * Initialize objectives for a new task attempt
 */
export function initializeObjectives(learningObjectives: unknown): ObjectiveTracking[] {
  const objectives = learningObjectives as string[];
  return objectives.map((text, index) => ({
    objectiveId: index.toString(),
    objectiveText: text,
    status: 'pending' as const,
    confidence: 0,
    evidence: [],
  }));
}

/**
 * Calculate overall progress statistics
 */
export function calculateProgress(objectives: ObjectiveTracking[]) {
  const completed = objectives.filter(obj => obj.status === 'completed').length;
  const total = objectives.length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    completedCount: completed,
    totalCount: total,
    completionRate,
    allCompleted: completed === total,
  };
}

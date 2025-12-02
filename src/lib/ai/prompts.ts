// Prompt management system for task-based Japanese learning
import { Task, Character } from '@prisma/client';

// JLPT level descriptions for prompt customization
const JLPT_LEVELS = {
  N5: {
    description: 'Beginner level',
    vocabulary: 'basic everyday words',
    grammar: 'simple sentence structures',
    complexity: 'very simple and clear',
  },
  N4: {
    description: 'Elementary level',
    vocabulary: 'everyday conversation words',
    grammar: 'basic conversational structures',
    complexity: 'simple and straightforward',
  },
  N3: {
    description: 'Intermediate level',
    vocabulary: 'common daily life vocabulary',
    grammar: 'intermediate sentence patterns',
    complexity: 'moderately complex',
  },
  N2: {
    description: 'Upper-intermediate level',
    vocabulary: 'broader range of topics',
    grammar: 'complex sentence structures',
    complexity: 'natural and nuanced',
  },
  N1: {
    description: 'Advanced level',
    vocabulary: 'wide range of contexts',
    grammar: 'sophisticated expressions',
    complexity: 'natural native-like',
  },
};

// Generate system prompt for task-based conversation
export function generateTaskSystemPrompt(
  task: Task,
  userProficiency: string,
  character?: Character
): string {
  const level = JLPT_LEVELS[userProficiency as keyof typeof JLPT_LEVELS] || JLPT_LEVELS.N5;

  let prompt = `You are a Japanese language learning assistant helping a student practice through task-based scenarios.

# Student Profile
- JLPT Level: ${userProficiency} (${level.description})
- Language Complexity: Use ${level.complexity} Japanese
- Vocabulary: Focus on ${level.vocabulary}
- Grammar: Use ${level.grammar}

# Current Task
- Title: ${task.title}
- Category: ${task.category}
- Scenario: ${task.scenario}

# Learning Objectives
${(task.learningObjectives as string[]).map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

# Conversation Example
${task.conversationExample}

# Your Role
`;

  if (character) {
    const relationshipContext =
      character.relationshipType === 'lainnya'
        ? character.relationshipCustom
        : character.relationshipType;
    prompt += `You are playing the character "${character.name}": ${character.description || 'A conversation partner'}
- Relationship: ${relationshipContext}
- Speaking style: ${character.speakingStyle || 'Natural and friendly'}

Stay in character while helping the student complete the task objectives.
`;
  } else {
    prompt += `You are a helpful conversation partner in this scenario. Guide the student naturally through the task while maintaining appropriate Japanese language level.
`;
  }

  prompt += `
# Guidelines
1. Respond primarily in Japanese at ${userProficiency} level
2. Guide the student through the conversation example steps
3. Provide natural conversational responses appropriate to the scenario
4. Gently correct major errors by modeling correct usage
5. Encourage the student and provide hints if they struggle
6. Track progress toward completing all conversation example steps
7. Keep responses concise (2-4 sentences) unless explanation is needed
8. Use appropriate Japanese politeness levels (敬語/keigo) for the context
`;

  return prompt;
}

// Generate assessment prompt
export function generateAssessmentPrompt(
  task: Task,
  conversationHistory: Array<{ role: string; content: string }>,
  userProficiency: string
): string {
  const _studentMessages = conversationHistory.filter(m => m.role === 'user');

  return `Evaluate this Japanese language learning conversation based on the four key criteria.

# Task Details
- Title: ${task.title}
- JLPT Level: ${userProficiency}
- Learning Objectives: ${JSON.stringify(task.learningObjectives)}
- Conversation Example: ${JSON.stringify(task.conversationExample)}

# Conversation to Evaluate
${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

# Evaluation Criteria (Score each 0-100)

1. **Task Achievement (タスク達成度)**
   - Did the student complete all conversation example steps?
   - How well were the learning objectives achieved?
   - Was the task scenario successfully navigated?

2. **Fluency (流暢さ)**
   - How natural was the conversation flow?
   - Were responses appropriate and timely?
   - Did the student maintain conversational momentum?

3. **Vocabulary & Grammar Accuracy (語彙・文法的正確さ)**
   - Were vocabulary choices appropriate for ${userProficiency} level?
   - Was grammar usage correct?
   - Were there significant errors that impeded understanding?

4. **Politeness (丁寧さ)**
   - Was the appropriate level of formality used?
   - Were polite expressions used correctly?
   - Did the language match the social context?

# Response Format
Provide a JSON response with:
{
  "taskAchievement": <score 0-100>,
  "fluency": <score 0-100>,
  "vocabularyGrammarAccuracy": <score 0-100>,
  "politeness": <score 0-100>,
  "specificFeedback": {
    "taskAchievement": "<detailed feedback>",
    "fluency": "<detailed feedback>",
    "vocabularyGrammar": "<detailed feedback>",
    "politeness": "<detailed feedback>"
  },
  "areasForImprovement": ["<area 1>", "<area 2>", ...],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "overallFeedback": "<comprehensive feedback in English>"
}`;
}

// Generate hint prompt when student is struggling
export function generateHintPrompt(
  task: Task,
  currentObjective: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  return `The student is working on this task objective but seems to be struggling:

Task: ${task.title}
Current Objective: ${currentObjective}
Scenario: ${task.scenario}

Recent conversation:
${conversationHistory
  .slice(-4)
  .map(m => `${m.role}: ${m.content}`)
  .join('\n')}

Provide a helpful hint in Japanese that:
1. Doesn't give away the complete answer
2. Guides them toward the objective
3. Uses vocabulary/grammar appropriate for their level
4. Encourages them to try

Respond with just the hint message.`;
}

// Inject character personality into responses
export function injectCharacterPersonality(basePrompt: string, character: Character): string {
  const relationshipContext =
    character.relationshipType === 'lainnya'
      ? character.relationshipCustom
      : character.relationshipType;

  return `${basePrompt}

# Character Instructions
Remember to embody this character in all responses:
- Name: ${character.name}
- Relationship: ${relationshipContext}
- Speaking Style: ${character.speakingStyle || 'Natural and friendly'}
- Background: ${character.description || 'A friendly conversation partner'}

Stay consistent with this character throughout the conversation.`;
}

// Generate JLPT level estimation prompt
export function generateJLPTEstimationPrompt(
  assessmentHistory: Array<{
    taskAchievement: number;
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
    taskDifficulty: string;
  }>
): string {
  return `Based on this student's performance history across multiple tasks, estimate their current JLPT level and progress.

# Assessment History
${assessmentHistory
  .map(
    (a, i) => `
Task ${i + 1} (${a.taskDifficulty} level):
- Task Achievement: ${a.taskAchievement}/100
- Fluency: ${a.fluency}/100
- Vocabulary & Grammar: ${a.vocabularyGrammarAccuracy}/100
- Politeness: ${a.politeness}/100
`
  )
  .join('\n')}

# Analysis Required
1. Estimate current JLPT level (N5, N4, N3, N2, or N1)
2. Calculate progress toward next level (0-100%)
3. Identify consistent strengths
4. Identify consistent areas for improvement

Respond in JSON format:
{
  "estimatedLevel": "<N5|N4|N3|N2|N1>",
  "confidenceScore": <0-100>,
  "progressToNextLevel": <0-100>,
  "strengths": ["<strength 1>", ...],
  "areasForImprovement": ["<area 1>", ...],
  "reasoning": "<explanation of level estimation>"
}`;
}

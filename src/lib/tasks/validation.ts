/**
 * Task Validation Utilities
 * Validates task data for creation and updates
 */

export interface TaskValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TaskData {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  scenario?: string;
  learningObjectives?: string[];
  conversationExample?: string;
  estimatedDuration?: number;
  prerequisites?: string[];
  characterId?: string | null;
}

const VALID_DIFFICULTIES = ['N5', 'N4', 'N3', 'N2', 'N1'];

const VALID_CATEGORIES = [
  'Restaurant',
  'Shopping',
  'Travel',
  'Business',
  'Healthcare',
  'Education',
  'Daily Life',
  'Emergency',
  'Social Events',
  'Technology',
];

/**
 * Validate task data for creation or update
 */
export function validateTaskData(data: TaskData, isUpdate = false): TaskValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation (only for creation)
  if (!isUpdate) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!data.category) {
      errors.push('Category is required');
    }

    if (!data.difficulty) {
      errors.push('Difficulty is required');
    }

    if (!data.scenario || data.scenario.trim().length === 0) {
      errors.push('Scenario is required');
    }

    if (!data.learningObjectives || data.learningObjectives.length === 0) {
      errors.push('At least one learning objective is required');
    }

    if (!data.conversationExample || data.conversationExample.trim().length === 0) {
      errors.push('Conversation example is required');
    }

    if (!data.estimatedDuration || data.estimatedDuration <= 0) {
      errors.push('Estimated duration must be greater than 0');
    }
  }

  // Title validation
  if (data.title !== undefined) {
    if (data.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }

    if (data.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }
  }

  // Description validation
  if (data.description !== undefined) {
    if (data.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    if (data.description.length > 5000) {
      errors.push('Description must not exceed 5000 characters');
    }
  }

  // Category validation
  if (data.category !== undefined) {
    if (!VALID_CATEGORIES.includes(data.category)) {
      warnings.push(
        `Category "${data.category}" is not in the standard list. Consider using one of: ${VALID_CATEGORIES.join(', ')}`
      );
    }
  }

  // Difficulty validation
  if (data.difficulty !== undefined) {
    if (!VALID_DIFFICULTIES.includes(data.difficulty)) {
      errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
    }
  }

  // Scenario validation
  if (data.scenario !== undefined) {
    if (data.scenario.trim().length < 50) {
      errors.push('Scenario must be at least 50 characters long');
    }

    if (data.scenario.length > 10000) {
      errors.push('Scenario must not exceed 10000 characters');
    }
  }

  // Learning objectives validation
  if (data.learningObjectives !== undefined) {
    if (!Array.isArray(data.learningObjectives)) {
      errors.push('Learning objectives must be an array');
    } else {
      if (data.learningObjectives.length === 0) {
        errors.push('At least one learning objective is required');
      }

      if (data.learningObjectives.length > 10) {
        warnings.push('More than 10 learning objectives may be overwhelming for students');
      }

      data.learningObjectives.forEach((objective, index) => {
        if (typeof objective !== 'string' || objective.trim().length === 0) {
          errors.push(`Learning objective ${index + 1} must be a non-empty string`);
        }

        if (objective.length > 500) {
          errors.push(`Learning objective ${index + 1} must not exceed 500 characters`);
        }
      });
    }
  }

  // Conversation example validation
  if (data.conversationExample !== undefined) {
    if (typeof data.conversationExample !== 'string') {
      errors.push('Conversation example must be a string');
    } else {
      if (data.conversationExample.trim().length === 0) {
        errors.push('Conversation example is required');
      }

      if (data.conversationExample.trim().length < 20) {
        errors.push('Conversation example must be at least 20 characters long');
      }

      if (data.conversationExample.length > 5000) {
        errors.push('Conversation example must not exceed 5000 characters');
      }

      // Check for T: and G: format
      if (!data.conversationExample.includes('T:') && !data.conversationExample.includes('G:')) {
        warnings.push(
          'Conversation example should include T: (teacher) and G: (student) dialog format'
        );
      }
    }
  }

  // Estimated duration validation
  if (data.estimatedDuration !== undefined) {
    if (typeof data.estimatedDuration !== 'number') {
      errors.push('Estimated duration must be a number');
    } else {
      if (data.estimatedDuration <= 0) {
        errors.push('Estimated duration must be greater than 0');
      }

      if (data.estimatedDuration > 180) {
        warnings.push(
          'Tasks longer than 3 hours may be difficult for students to complete in one session'
        );
      }

      if (data.estimatedDuration < 5) {
        warnings.push('Tasks shorter than 5 minutes may not provide meaningful learning');
      }
    }
  }

  // Prerequisites validation
  if (data.prerequisites !== undefined) {
    if (!Array.isArray(data.prerequisites)) {
      errors.push('Prerequisites must be an array');
    } else if (data.prerequisites.length > 0) {
      data.prerequisites.forEach((prerequisite, index) => {
        if (typeof prerequisite !== 'string' || prerequisite.trim().length === 0) {
          errors.push(`Prerequisite ${index + 1} must be a non-empty string`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate difficulty alignment with learning objectives
 */
export function validateDifficultyAlignment(
  difficulty: string,
  learningObjectives: string[]
): TaskValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Difficulty-specific keyword checks
  const difficultyKeywords: Record<string, string[]> = {
    N5: ['basic', 'simple', 'beginner', 'introduction', 'fundamental'],
    N4: ['everyday', 'common', 'familiar', 'routine', 'simple conversation'],
    N3: ['intermediate', 'complex', 'detailed', 'nuanced', 'abstract'],
    N2: ['advanced', 'sophisticated', 'professional', 'specialized', 'formal'],
    N1: ['expert', 'native-like', 'complex', 'academic', 'literary'],
  };

  const keywords = difficultyKeywords[difficulty] || [];
  const objectivesText = learningObjectives.join(' ').toLowerCase();

  let matchCount = 0;
  keywords.forEach(keyword => {
    if (objectivesText.includes(keyword)) {
      matchCount++;
    }
  });

  if (matchCount === 0 && learningObjectives.length > 0) {
    warnings.push(
      `Learning objectives may not align with ${difficulty} difficulty level. Consider reviewing.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate task completeness for approval
 */
export function validateTaskCompleteness(task: TaskData): TaskValidationResult {
  const baseValidation = validateTaskData(task, false);

  const warnings = [...baseValidation.warnings];

  // Additional completeness checks
  if (!task.characterId) {
    warnings.push('No character assigned - consider assigning a character for better context');
  }

  if (!task.prerequisites || task.prerequisites.length === 0) {
    warnings.push('No prerequisites defined - consider adding if applicable');
  }

  if (task.estimatedDuration && task.estimatedDuration % 5 !== 0) {
    warnings.push('Estimated duration is not a multiple of 5 - consider rounding for consistency');
  }

  // Check if conversation example is present and has good length
  if (task.conversationExample) {
    if (task.conversationExample.trim().length < 50) {
      warnings.push('Conversation example is quite short - consider adding more dialog exchanges');
    }
  }

  return {
    isValid: baseValidation.isValid,
    errors: baseValidation.errors,
    warnings,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import {
  validateTaskData,
  validateDifficultyAlignment,
  validateTaskCompleteness,
  type TaskValidationResult,
} from '@/lib/tasks/validation';

// POST /api/tasks/validate - Validate task data before creation/update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskData, checkCompleteness = false } = body;

    if (!taskData) {
      return NextResponse.json({ error: 'Task data is required' }, { status: 400 });
    }

    // Basic validation
    const basicValidation = validateTaskData(taskData, false);

    // Difficulty alignment validation
    let difficultyValidation: TaskValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };
    if (taskData.difficulty && taskData.learningObjectives) {
      difficultyValidation = validateDifficultyAlignment(
        taskData.difficulty,
        taskData.learningObjectives
      );
    }

    // Completeness validation
    let completenessValidation: TaskValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };
    if (checkCompleteness) {
      completenessValidation = validateTaskCompleteness(taskData);
    }

    // Combine all validations
    const allErrors = [
      ...basicValidation.errors,
      ...difficultyValidation.errors,
      ...completenessValidation.errors,
    ];

    const allWarnings = [
      ...basicValidation.warnings,
      ...difficultyValidation.warnings,
      ...completenessValidation.warnings,
    ];

    const isValid = allErrors.length === 0;

    return NextResponse.json({
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      validationDetails: {
        basic: basicValidation,
        difficultyAlignment: difficultyValidation,
        completeness: checkCompleteness ? completenessValidation : undefined,
      },
    });
  } catch (error) {
    console.error('Error validating task:', error);
    return NextResponse.json({ error: 'Failed to validate task' }, { status: 500 });
  }
}

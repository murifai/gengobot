import * as XLSX from 'xlsx';

export interface PassageData {
  passage_id: string;
  content_type: 'text' | 'audio' | 'image';
  title?: string;
  content_text?: string;
  media_url?: string;
}

export interface QuestionData {
  passage_id?: string;
  passage_id_secondary?: string; // For A-B comparison
  question_number: number;
  question_text: string;
  question_type: 'standard' | 'cloze' | 'comparison' | 'graphic';
  blank_position?: string;
  media_url?: string;
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  choices: {
    choice_number: number;
    choice_text: string;
    choice_media_url?: string;
  }[];
}

export interface ParseResult {
  passages: PassageData[];
  questions: QuestionData[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse Excel file with 2-sheet format (Passages + Questions)
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const passages: PassageData[] = [];
  const questions: QuestionData[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Validate required sheets
    if (!workbook.SheetNames.includes('Passages') && !workbook.SheetNames.includes('Questions')) {
      errors.push('Excel file must contain "Passages" and/or "Questions" sheet');
      return { passages, questions, errors, warnings };
    }

    // Parse Passages sheet (optional)
    if (workbook.SheetNames.includes('Passages')) {
      const passagesSheet = workbook.Sheets['Passages'];
      const passagesData = XLSX.utils.sheet_to_json(passagesSheet, { defval: '' });

      passagesData.forEach((row: any, index: number) => {
        const rowNum = index + 2; // Excel row number (header is row 1)

        // Validate required fields
        if (!row.passage_id) {
          errors.push(`Row ${rowNum} in Passages: passage_id is required`);
          return;
        }

        if (!row.content_type) {
          errors.push(`Row ${rowNum} in Passages: content_type is required`);
          return;
        }

        const contentType = row.content_type.toLowerCase();
        if (!['text', 'audio', 'image'].includes(contentType)) {
          errors.push(
            `Row ${rowNum} in Passages: content_type must be "text", "audio", or "image"`
          );
          return;
        }

        // Validate content based on type
        if (contentType === 'text' && !row.content_text) {
          errors.push(`Row ${rowNum} in Passages: content_text is required for text passages`);
          return;
        }

        if ((contentType === 'audio' || contentType === 'image') && !row.media_url) {
          errors.push(
            `Row ${rowNum} in Passages: media_url is required for audio/image passages`
          );
          return;
        }

        passages.push({
          passage_id: row.passage_id.toString(),
          content_type: contentType as 'text' | 'audio' | 'image',
          title: row.title || undefined,
          content_text: row.content_text || undefined,
          media_url: row.media_url || undefined,
        });
      });
    }

    // Parse Questions sheet (required)
    if (workbook.SheetNames.includes('Questions')) {
      const questionsSheet = workbook.Sheets['Questions'];
      const questionsData = XLSX.utils.sheet_to_json(questionsSheet, { defval: '' });

      questionsData.forEach((row: any, index: number) => {
        const rowNum = index + 2;

        // Validate required fields
        if (!row.question_number) {
          errors.push(`Row ${rowNum} in Questions: question_number is required`);
          return;
        }

        if (!row.question_text) {
          errors.push(`Row ${rowNum} in Questions: question_text is required`);
          return;
        }

        if (!row.correct_answer) {
          errors.push(`Row ${rowNum} in Questions: correct_answer is required`);
          return;
        }

        // Parse choices (columns: choice_1, choice_2, choice_3, choice_4)
        const choices: QuestionData['choices'] = [];
        for (let i = 1; i <= 4; i++) {
          const choiceText = row[`choice_${i}`];
          if (choiceText) {
            choices.push({
              choice_number: i,
              choice_text: choiceText.toString(),
              choice_media_url: row[`choice_${i}_media`] || undefined,
            });
          }
        }

        // Validate at least 3 choices
        if (choices.length < 3) {
          errors.push(`Row ${rowNum} in Questions: At least 3 answer choices required`);
          return;
        }

        // Validate correct answer is within range
        const correctAnswer = parseInt(row.correct_answer.toString());
        if (correctAnswer < 1 || correctAnswer > choices.length) {
          errors.push(
            `Row ${rowNum} in Questions: correct_answer must be between 1 and ${choices.length}`
          );
          return;
        }

        // Determine question type
        let questionType: QuestionData['question_type'] = 'standard';
        if (row.question_type) {
          const type = row.question_type.toLowerCase();
          if (['standard', 'cloze', 'comparison', 'graphic'].includes(type)) {
            questionType = type as QuestionData['question_type'];
          } else {
            warnings.push(
              `Row ${rowNum} in Questions: Invalid question_type "${row.question_type}", using "standard"`
            );
          }
        }

        // Determine difficulty
        let difficulty: QuestionData['difficulty'] = 'medium';
        if (row.difficulty) {
          const diff = row.difficulty.toLowerCase();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            difficulty = diff as QuestionData['difficulty'];
          } else {
            warnings.push(
              `Row ${rowNum} in Questions: Invalid difficulty "${row.difficulty}", using "medium"`
            );
          }
        }

        questions.push({
          passage_id: row.passage_id ? row.passage_id.toString() : undefined,
          passage_id_secondary: row.passage_id_secondary
            ? row.passage_id_secondary.toString()
            : undefined,
          question_number: parseInt(row.question_number.toString()),
          question_text: row.question_text.toString(),
          question_type: questionType,
          blank_position: row.blank_position || undefined,
          media_url: row.media_url || undefined,
          correct_answer: correctAnswer,
          difficulty,
          choices,
        });
      });
    } else {
      errors.push('Questions sheet is required');
    }

    // Cross-validate passage references
    const passageIds = new Set(passages.map((p) => p.passage_id));
    questions.forEach((q, index) => {
      if (q.passage_id && !passageIds.has(q.passage_id)) {
        warnings.push(
          `Question ${q.question_number}: References non-existent passage_id "${q.passage_id}"`
        );
      }
      if (q.passage_id_secondary && !passageIds.has(q.passage_id_secondary)) {
        warnings.push(
          `Question ${q.question_number}: References non-existent passage_id_secondary "${q.passage_id_secondary}"`
        );
      }
    });

    // Validate duplicate passage IDs
    const passageIdCounts = new Map<string, number>();
    passages.forEach((p) => {
      passageIdCounts.set(p.passage_id, (passageIdCounts.get(p.passage_id) || 0) + 1);
    });
    for (const [passageId, count] of passageIdCounts.entries()) {
      if (count > 1) {
        errors.push(`Duplicate passage_id found: "${passageId}" appears ${count} times`);
      }
    }

    // Validate duplicate question numbers
    const questionNumCounts = new Map<number, number>();
    questions.forEach((q) => {
      questionNumCounts.set(
        q.question_number,
        (questionNumCounts.get(q.question_number) || 0) + 1
      );
    });
    for (const [questionNum, count] of questionNumCounts.entries()) {
      if (count > 1) {
        errors.push(`Duplicate question_number found: ${questionNum} appears ${count} times`);
      }
    }
  } catch (error: any) {
    errors.push(`Failed to parse Excel file: ${error.message}`);
  }

  return { passages, questions, errors, warnings };
}

/**
 * Generate Excel template for a specific mondai
 */
export function generateExcelTemplate(mondaiConfig: {
  requiresPassage: boolean;
  passageCount?: number;
  questionsPerPassage?: number;
  questionNumbers: number[];
  mondaiType: string;
}): Buffer {
  const workbook = XLSX.utils.book_new();

  // Create Passages sheet (if needed)
  if (mondaiConfig.requiresPassage) {
    const passageData: any[] = [];
    const passageCount = mondaiConfig.passageCount || 1;

    for (let i = 1; i <= passageCount; i++) {
      const passageId = mondaiConfig.mondaiType === 'ab_comparison' && i === 2 ? 'B' : `${i}`;
      passageData.push({
        passage_id: passageId,
        content_type: 'text',
        title: `Passage ${passageId} Title`,
        content_text: `[Enter passage ${passageId} content here]`,
        media_url: '',
      });
    }

    const passagesSheet = XLSX.utils.json_to_sheet(passageData);
    XLSX.utils.book_append_sheet(workbook, passagesSheet, 'Passages');
  }

  // Create Questions sheet
  const questionsData: any[] = [];
  mondaiConfig.questionNumbers.forEach((questionNum, index) => {
    const row: any = {
      passage_id: '',
      passage_id_secondary: '',
      question_number: questionNum,
      question_text: `[Enter question ${questionNum} text here]`,
      question_type: 'standard',
      blank_position: '',
      media_url: '',
      choice_1: 'Choice 1',
      choice_1_media: '',
      choice_2: 'Choice 2',
      choice_2_media: '',
      choice_3: 'Choice 3',
      choice_3_media: '',
      choice_4: 'Choice 4',
      choice_4_media: '',
      correct_answer: 1,
      difficulty: 'medium',
    };

    // Auto-fill passage_id for passage-based mondai
    if (mondaiConfig.requiresPassage) {
      if (mondaiConfig.mondaiType === 'ab_comparison') {
        row.passage_id = 'A';
        row.passage_id_secondary = 'B';
      } else if (mondaiConfig.mondaiType === 'cloze_test') {
        row.passage_id = '1';
      } else if (mondaiConfig.passageCount && mondaiConfig.questionsPerPassage) {
        const passageIndex = Math.floor(index / mondaiConfig.questionsPerPassage) + 1;
        row.passage_id = `${passageIndex}`;
      }
    }

    questionsData.push(row);
  });

  const questionsSheet = XLSX.utils.json_to_sheet(questionsData);
  XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

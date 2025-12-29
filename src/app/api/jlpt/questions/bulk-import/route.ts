import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { prisma } from '@/lib/prisma';
import { parseExcelFile } from '@/lib/utils/excel-parser';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string;
    const section = formData.get('section') as string;
    const mondai = parseInt(formData.get('mondai') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!level || !section || !mondai) {
      return NextResponse.json(
        { error: 'level, section, and mondai are required' },
        { status: 400 }
      );
    }

    // Parse Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = parseExcelFile(buffer);

    // Return errors if validation failed
    if (parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors: parseResult.errors,
        warnings: parseResult.warnings,
      });
    }

    // Import data in transaction
    const result = await prisma.$transaction(async tx => {
      const passageMap = new Map<string, string>(); // Excel passage_id -> DB passage.id
      const questionUnits: string[] = [];

      // Step 1: Create all passages from Passages sheet
      if (parseResult.passages.length > 0) {
        for (const passageData of parseResult.passages) {
          const passage = await tx.jLPTPassage.create({
            data: {
              contentType: passageData.content_type,
              title: passageData.title,
              contentText: passageData.content_text,
              mediaUrl: passageData.media_url,
              createdBy: session.adminId,
            },
          });

          // Map Excel passage_id to database passage.id
          passageMap.set(passageData.passage_id, passage.id);
        }
      }

      // Step 2: Create question units (if needed)
      // For A-B comparison, create one unit with both passages
      const abComparisonQuestions = parseResult.questions.filter(
        q => q.passage_id && q.passage_id_secondary
      );
      if (abComparisonQuestions.length > 0) {
        const primaryPassageId = passageMap.get(abComparisonQuestions[0].passage_id!);
        const secondaryPassageId = passageMap.get(abComparisonQuestions[0].passage_id_secondary!);

        const unit = await tx.jLPTQuestionUnit.create({
          data: {
            level,
            sectionType: section,
            mondaiNumber: mondai,
            unitType: 'ab_comparison',
            passageId: primaryPassageId!,
            passageIdSecondary: secondaryPassageId!,
          },
        });
        questionUnits.push(unit.id);
      } else if (parseResult.passages.length > 0) {
        // For other passage-based mondai, create units per passage
        for (const [excelPassageId, dbPassageId] of passageMap.entries()) {
          const unitType = parseResult.questions.some(q => q.question_type === 'cloze')
            ? 'cloze_test'
            : 'reading_comp';

          const unit = await tx.jLPTQuestionUnit.create({
            data: {
              level,
              sectionType: section,
              mondaiNumber: mondai,
              unitType,
              passageId: dbPassageId,
            },
          });
          questionUnits.push(unit.id);
        }
      }

      // Step 3: Create questions
      const createdQuestions = await Promise.all(
        parseResult.questions.map(async q => {
          // Map passage IDs from Excel to database
          const primaryPassageId = q.passage_id ? passageMap.get(q.passage_id) : undefined;
          const secondaryPassageId = q.passage_id_secondary
            ? passageMap.get(q.passage_id_secondary)
            : undefined;

          const question = await tx.jLPTQuestion.create({
            data: {
              level,
              sectionType: section,
              mondaiNumber: mondai,
              passageId: primaryPassageId,
              questionText: q.question_text,
              questionType: q.question_type,
              blankPosition: q.blank_position,
              mediaUrl: q.media_url,
              correctAnswer: q.correct_answer,
              difficulty: q.difficulty,
              createdBy: session.adminId,
            },
          });

          // Create answer choices
          await tx.jLPTAnswerChoice.createMany({
            data: q.choices.map(c => ({
              questionId: question.id,
              choiceNumber: c.choice_number,
              choiceText: c.choice_text,
              choiceMediaUrl: c.choice_media_url,
            })),
          });

          // Link questions to units
          if (questionUnits.length > 0) {
            // For A-B comparison, all questions link to the same unit
            if (secondaryPassageId) {
              await tx.jLPTUnitQuestion.create({
                data: {
                  unitId: questionUnits[0],
                  questionId: question.id,
                },
              });
            } else if (primaryPassageId) {
              // For other passage types, link to the appropriate unit
              const unitIndex = Array.from(passageMap.values()).indexOf(primaryPassageId);
              if (unitIndex !== -1 && questionUnits[unitIndex]) {
                await tx.jLPTUnitQuestion.create({
                  data: {
                    unitId: questionUnits[unitIndex],
                    questionId: question.id,
                  },
                });
              }
            }
          }

          return question;
        })
      );

      return {
        passages_created: parseResult.passages.length,
        units_created: questionUnits.length,
        questions_created: createdQuestions.length,
        passage_ids: Array.from(passageMap.values()),
        unit_ids: questionUnits,
        question_ids: createdQuestions.map(q => q.id),
      };
    });

    return NextResponse.json({
      success: true,
      imported_count: parseResult.questions.length,
      warnings: parseResult.warnings,
      data: result,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Import failed', details: message }, { status: 500 });
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function previewCleanup() {
  console.log('🔍 JLPT Question Bank - Cleanup Preview\n');
  console.log('═'.repeat(50));

  try {
    // Count all records that would be deleted
    const analyticsCount = await prisma.jLPTQuestionAnalytics.count();
    const userAnswersCount = await prisma.jLPTUserAnswer.count();
    const unitQuestionsCount = await prisma.jLPTUnitQuestion.count();
    const unitsCount = await prisma.jLPTQuestionUnit.count();
    const choicesCount = await prisma.jLPTAnswerChoice.count();
    const questionsCount = await prisma.jLPTQuestion.count();
    const passagesCount = await prisma.jLPTPassage.count();

    console.log('\n📊 Records that will be deleted:\n');
    console.log(`   📄 Passages:          ${passagesCount.toLocaleString()}`);
    console.log(`   ❓ Questions:         ${questionsCount.toLocaleString()}`);
    console.log(`   ✅ Answer Choices:    ${choicesCount.toLocaleString()}`);
    console.log(`   📦 Question Units:    ${unitsCount.toLocaleString()}`);
    console.log(`   🔗 Unit Questions:    ${unitQuestionsCount.toLocaleString()}`);
    console.log(`   👤 User Answers:      ${userAnswersCount.toLocaleString()}`);
    console.log(`   📊 Analytics:         ${analyticsCount.toLocaleString()}`);
    console.log(`   ────────────────────────────────────────────────`);
    console.log(
      `   🗑️  TOTAL:             ${(
        passagesCount +
        questionsCount +
        choicesCount +
        unitsCount +
        unitQuestionsCount +
        userAnswersCount +
        analyticsCount
      ).toLocaleString()} records`
    );

    console.log('\n═'.repeat(50));

    // Show breakdown by level
    console.log('\n📈 Questions by Level:\n');
    const byLevel = await prisma.jLPTQuestion.groupBy({
      by: ['level'],
      _count: true,
    });

    byLevel.forEach(item => {
      console.log(`   ${item.level}: ${item._count.toLocaleString()} questions`);
    });

    // Show breakdown by section
    console.log('\n📚 Questions by Section:\n');
    const bySection = await prisma.jLPTQuestion.groupBy({
      by: ['sectionType'],
      _count: true,
    });

    bySection.forEach(item => {
      console.log(`   ${item.sectionType}: ${item._count.toLocaleString()} questions`);
    });

    console.log('\n═'.repeat(50));
    console.log('\n⚠️  WARNING: This operation cannot be undone!');
    console.log('\n📝 To proceed with cleanup, run:');
    console.log('   npm run cleanup:jlpt\n');
  } catch (error) {
    console.error('❌ Error during preview:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the preview
previewCleanup()
  .then(() => {
    console.log('✅ Preview completed\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Preview failed:', error);
    process.exit(1);
  });

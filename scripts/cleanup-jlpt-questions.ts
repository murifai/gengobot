import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupJLPTQuestions() {
  console.log('🗑️  Starting JLPT Question Bank Cleanup...\n');

  try {
    // Delete in correct order due to foreign key constraints
    console.log('📊 Deleting Question Analytics...');
    const analyticsCount = await prisma.jLPTQuestionAnalytics.deleteMany({});
    console.log(`   ✓ Deleted ${analyticsCount.count} analytics records\n`);

    console.log('👤 Deleting User Answers...');
    const userAnswersCount = await prisma.jLPTUserAnswer.deleteMany({});
    console.log(`   ✓ Deleted ${userAnswersCount.count} user answers\n`);

    console.log('🔗 Deleting Unit Questions...');
    const unitQuestionsCount = await prisma.jLPTUnitQuestion.deleteMany({});
    console.log(`   ✓ Deleted ${unitQuestionsCount.count} unit questions\n`);

    console.log('📦 Deleting Question Units...');
    const unitsCount = await prisma.jLPTQuestionUnit.deleteMany({});
    console.log(`   ✓ Deleted ${unitsCount.count} question units\n`);

    console.log('✅ Deleting Answer Choices...');
    const choicesCount = await prisma.jLPTAnswerChoice.deleteMany({});
    console.log(`   ✓ Deleted ${choicesCount.count} answer choices\n`);

    console.log('❓ Deleting Questions...');
    const questionsCount = await prisma.jLPTQuestion.deleteMany({});
    console.log(`   ✓ Deleted ${questionsCount.count} questions\n`);

    console.log('📄 Deleting Passages...');
    const passagesCount = await prisma.jLPTPassage.deleteMany({});
    console.log(`   ✓ Deleted ${passagesCount.count} passages\n`);

    console.log('═'.repeat(50));
    console.log('✨ CLEANUP COMPLETE! Database is now fresh.');
    console.log('═'.repeat(50));
    console.log('\n📈 Summary:');
    console.log(`   - Passages: ${passagesCount.count}`);
    console.log(`   - Questions: ${questionsCount.count}`);
    console.log(`   - Answer Choices: ${choicesCount.count}`);
    console.log(`   - Question Units: ${unitsCount.count}`);
    console.log(`   - Unit Questions: ${unitQuestionsCount.count}`);
    console.log(`   - User Answers: ${userAnswersCount.count}`);
    console.log(`   - Analytics: ${analyticsCount.count}`);
    console.log(`   ────────────────────────────────────`);
    console.log(
      `   Total Records Deleted: ${
        passagesCount.count +
        questionsCount.count +
        choicesCount.count +
        unitsCount.count +
        unitQuestionsCount.count +
        userAnswersCount.count +
        analyticsCount.count
      }`
    );
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupJLPTQuestions()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

async function verifyTables() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking database tables...\n');

    // Check if we can access the Deck model
    const deckCount = await prisma.deck.count();
    console.log('✅ Deck table exists - Count:', deckCount);

    // Check if we can access the Flashcard model
    const flashcardCount = await prisma.flashcard.count();
    console.log('✅ Flashcard table exists - Count:', flashcardCount);

    // Check if we can access the FlashcardReview model
    const reviewCount = await prisma.flashcardReview.count();
    console.log('✅ FlashcardReview table exists - Count:', reviewCount);

    // Check if we can access the StudySession model
    const sessionCount = await prisma.studySession.count();
    console.log('✅ StudySession table exists - Count:', sessionCount);

    console.log('\n🎉 All deck system tables are working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();

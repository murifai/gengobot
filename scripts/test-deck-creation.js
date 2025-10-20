// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

async function testDeckCreation() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing deck creation...\n');

    // First, get a user to associate the deck with
    const user = await prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (!user) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }

    console.log(`✅ Found admin user: ${user.email}\n`);

    // Create a test deck
    const deck = await prisma.deck.create({
      data: {
        name: 'Test JLPT N5 Vocabulary',
        description: 'Basic Japanese vocabulary for beginners',
        category: 'Vocabulary',
        difficulty: 'N5',
        isPublic: true,
        createdBy: user.id,
      },
    });

    console.log('✅ Created test deck:', deck.name);
    console.log('   ID:', deck.id);
    console.log('   Category:', deck.category);
    console.log('   Difficulty:', deck.difficulty);
    console.log('   Public:', deck.isPublic);

    // Create test flashcards
    const flashcards = await Promise.all([
      // Kanji card
      prisma.flashcard.create({
        data: {
          deckId: deck.id,
          cardType: 'kanji',
          kanji: '日',
          kanjiMeaning: 'sun, day',
          onyomi: 'ニチ、ジツ',
          kunyomi: 'ひ、か',
          exampleSentence: '今日は良い天気です。',
          exampleTranslation: "Today's weather is good.",
          position: 0,
        },
      }),
      // Vocabulary card
      prisma.flashcard.create({
        data: {
          deckId: deck.id,
          cardType: 'vocabulary',
          word: '食べる',
          wordMeaning: 'to eat',
          reading: 'たべる',
          partOfSpeech: 'Verb (Ichidan)',
          exampleSentence: 'ご飯を食べます。',
          exampleTranslation: 'I eat rice.',
          position: 1,
        },
      }),
      // Grammar card
      prisma.flashcard.create({
        data: {
          deckId: deck.id,
          cardType: 'grammar',
          grammarPoint: '〜ています',
          grammarMeaning: 'To be doing something (continuous action)',
          usageNote: 'Verb て-form + います',
          exampleSentence: '今、本を読んでいます。',
          exampleTranslation: 'I am reading a book now.',
          position: 2,
        },
      }),
    ]);

    console.log(`\n✅ Created ${flashcards.length} test flashcards:`);
    flashcards.forEach((card, idx) => {
      console.log(`   ${idx + 1}. ${card.cardType} card (ID: ${card.id})`);
    });

    // Update deck total cards count
    await prisma.deck.update({
      where: { id: deck.id },
      data: { totalCards: flashcards.length },
    });

    console.log('\n✅ Updated deck card count');

    // Verify the data
    const finalDeck = await prisma.deck.findUnique({
      where: { id: deck.id },
      include: {
        flashcards: true,
        creator: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log('\n📊 Final verification:');
    console.log(`   Deck: ${finalDeck.name}`);
    console.log(`   Cards: ${finalDeck.flashcards.length}`);
    console.log(`   Creator: ${finalDeck.creator.email}`);
    console.log(`   Types: ${[...new Set(finalDeck.flashcards.map(f => f.cardType))].join(', ')}`);

    console.log('\n🎉 Deck system is working perfectly!');
    console.log(`\n📝 You can now view this deck at: http://localhost:3001/admin/decks`);
    console.log(`   Or in Prisma Studio at: http://localhost:5555`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeckCreation();

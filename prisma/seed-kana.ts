import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hiragana data - Basic 46 + Dakuten + Handakuten + Youon
const hiraganaData = [
  // Basic vowels (あ行)
  { character: 'あ', romaji: 'a' },
  { character: 'い', romaji: 'i' },
  { character: 'う', romaji: 'u' },
  { character: 'え', romaji: 'e' },
  { character: 'お', romaji: 'o' },

  // K row (か行)
  { character: 'か', romaji: 'ka' },
  { character: 'き', romaji: 'ki' },
  { character: 'く', romaji: 'ku' },
  { character: 'け', romaji: 'ke' },
  { character: 'こ', romaji: 'ko' },

  // S row (さ行)
  { character: 'さ', romaji: 'sa' },
  { character: 'し', romaji: 'shi' },
  { character: 'す', romaji: 'su' },
  { character: 'せ', romaji: 'se' },
  { character: 'そ', romaji: 'so' },

  // T row (た行)
  { character: 'た', romaji: 'ta' },
  { character: 'ち', romaji: 'chi' },
  { character: 'つ', romaji: 'tsu' },
  { character: 'て', romaji: 'te' },
  { character: 'と', romaji: 'to' },

  // N row (な行)
  { character: 'な', romaji: 'na' },
  { character: 'に', romaji: 'ni' },
  { character: 'ぬ', romaji: 'nu' },
  { character: 'ね', romaji: 'ne' },
  { character: 'の', romaji: 'no' },

  // H row (は行)
  { character: 'は', romaji: 'ha' },
  { character: 'ひ', romaji: 'hi' },
  { character: 'ふ', romaji: 'fu' },
  { character: 'へ', romaji: 'he' },
  { character: 'ほ', romaji: 'ho' },

  // M row (ま行)
  { character: 'ま', romaji: 'ma' },
  { character: 'み', romaji: 'mi' },
  { character: 'む', romaji: 'mu' },
  { character: 'め', romaji: 'me' },
  { character: 'も', romaji: 'mo' },

  // Y row (や行)
  { character: 'や', romaji: 'ya' },
  { character: 'ゆ', romaji: 'yu' },
  { character: 'よ', romaji: 'yo' },

  // R row (ら行)
  { character: 'ら', romaji: 'ra' },
  { character: 'り', romaji: 'ri' },
  { character: 'る', romaji: 'ru' },
  { character: 'れ', romaji: 're' },
  { character: 'ろ', romaji: 'ro' },

  // W row (わ行)
  { character: 'わ', romaji: 'wa' },
  { character: 'を', romaji: 'wo' },

  // N (ん)
  { character: 'ん', romaji: 'n' },

  // Dakuten - G row (が行)
  { character: 'が', romaji: 'ga' },
  { character: 'ぎ', romaji: 'gi' },
  { character: 'ぐ', romaji: 'gu' },
  { character: 'げ', romaji: 'ge' },
  { character: 'ご', romaji: 'go' },

  // Dakuten - Z row (ざ行)
  { character: 'ざ', romaji: 'za' },
  { character: 'じ', romaji: 'ji' },
  { character: 'ず', romaji: 'zu' },
  { character: 'ぜ', romaji: 'ze' },
  { character: 'ぞ', romaji: 'zo' },

  // Dakuten - D row (だ行)
  { character: 'だ', romaji: 'da' },
  { character: 'ぢ', romaji: 'ji' },
  { character: 'づ', romaji: 'zu' },
  { character: 'で', romaji: 'de' },
  { character: 'ど', romaji: 'do' },

  // Dakuten - B row (ば行)
  { character: 'ば', romaji: 'ba' },
  { character: 'び', romaji: 'bi' },
  { character: 'ぶ', romaji: 'bu' },
  { character: 'べ', romaji: 'be' },
  { character: 'ぼ', romaji: 'bo' },

  // Handakuten - P row (ぱ行)
  { character: 'ぱ', romaji: 'pa' },
  { character: 'ぴ', romaji: 'pi' },
  { character: 'ぷ', romaji: 'pu' },
  { character: 'ぺ', romaji: 'pe' },
  { character: 'ぽ', romaji: 'po' },

  // Youon - K combinations (きゃ行)
  { character: 'きゃ', romaji: 'kya' },
  { character: 'きゅ', romaji: 'kyu' },
  { character: 'きょ', romaji: 'kyo' },

  // Youon - S combinations (しゃ行)
  { character: 'しゃ', romaji: 'sha' },
  { character: 'しゅ', romaji: 'shu' },
  { character: 'しょ', romaji: 'sho' },

  // Youon - C combinations (ちゃ行)
  { character: 'ちゃ', romaji: 'cha' },
  { character: 'ちゅ', romaji: 'chu' },
  { character: 'ちょ', romaji: 'cho' },

  // Youon - N combinations (にゃ行)
  { character: 'にゃ', romaji: 'nya' },
  { character: 'にゅ', romaji: 'nyu' },
  { character: 'にょ', romaji: 'nyo' },

  // Youon - H combinations (ひゃ行)
  { character: 'ひゃ', romaji: 'hya' },
  { character: 'ひゅ', romaji: 'hyu' },
  { character: 'ひょ', romaji: 'hyo' },

  // Youon - M combinations (みゃ行)
  { character: 'みゃ', romaji: 'mya' },
  { character: 'みゅ', romaji: 'myu' },
  { character: 'みょ', romaji: 'myo' },

  // Youon - R combinations (りゃ行)
  { character: 'りゃ', romaji: 'rya' },
  { character: 'りゅ', romaji: 'ryu' },
  { character: 'りょ', romaji: 'ryo' },

  // Youon - G combinations (ぎゃ行)
  { character: 'ぎゃ', romaji: 'gya' },
  { character: 'ぎゅ', romaji: 'gyu' },
  { character: 'ぎょ', romaji: 'gyo' },

  // Youon - J combinations (じゃ行)
  { character: 'じゃ', romaji: 'ja' },
  { character: 'じゅ', romaji: 'ju' },
  { character: 'じょ', romaji: 'jo' },

  // Youon - B combinations (びゃ行)
  { character: 'びゃ', romaji: 'bya' },
  { character: 'びゅ', romaji: 'byu' },
  { character: 'びょ', romaji: 'byo' },

  // Youon - P combinations (ぴゃ行)
  { character: 'ぴゃ', romaji: 'pya' },
  { character: 'ぴゅ', romaji: 'pyu' },
  { character: 'ぴょ', romaji: 'pyo' },
];

// Katakana data - Same structure as Hiragana
const katakanaData = [
  // Basic vowels (ア行)
  { character: 'ア', romaji: 'a' },
  { character: 'イ', romaji: 'i' },
  { character: 'ウ', romaji: 'u' },
  { character: 'エ', romaji: 'e' },
  { character: 'オ', romaji: 'o' },

  // K row (カ行)
  { character: 'カ', romaji: 'ka' },
  { character: 'キ', romaji: 'ki' },
  { character: 'ク', romaji: 'ku' },
  { character: 'ケ', romaji: 'ke' },
  { character: 'コ', romaji: 'ko' },

  // S row (サ行)
  { character: 'サ', romaji: 'sa' },
  { character: 'シ', romaji: 'shi' },
  { character: 'ス', romaji: 'su' },
  { character: 'セ', romaji: 'se' },
  { character: 'ソ', romaji: 'so' },

  // T row (タ行)
  { character: 'タ', romaji: 'ta' },
  { character: 'チ', romaji: 'chi' },
  { character: 'ツ', romaji: 'tsu' },
  { character: 'テ', romaji: 'te' },
  { character: 'ト', romaji: 'to' },

  // N row (ナ行)
  { character: 'ナ', romaji: 'na' },
  { character: 'ニ', romaji: 'ni' },
  { character: 'ヌ', romaji: 'nu' },
  { character: 'ネ', romaji: 'ne' },
  { character: 'ノ', romaji: 'no' },

  // H row (ハ行)
  { character: 'ハ', romaji: 'ha' },
  { character: 'ヒ', romaji: 'hi' },
  { character: 'フ', romaji: 'fu' },
  { character: 'ヘ', romaji: 'he' },
  { character: 'ホ', romaji: 'ho' },

  // M row (マ行)
  { character: 'マ', romaji: 'ma' },
  { character: 'ミ', romaji: 'mi' },
  { character: 'ム', romaji: 'mu' },
  { character: 'メ', romaji: 'me' },
  { character: 'モ', romaji: 'mo' },

  // Y row (ヤ行)
  { character: 'ヤ', romaji: 'ya' },
  { character: 'ユ', romaji: 'yu' },
  { character: 'ヨ', romaji: 'yo' },

  // R row (ラ行)
  { character: 'ラ', romaji: 'ra' },
  { character: 'リ', romaji: 'ri' },
  { character: 'ル', romaji: 'ru' },
  { character: 'レ', romaji: 're' },
  { character: 'ロ', romaji: 'ro' },

  // W row (ワ行)
  { character: 'ワ', romaji: 'wa' },
  { character: 'ヲ', romaji: 'wo' },

  // N (ン)
  { character: 'ン', romaji: 'n' },

  // Dakuten - G row (ガ行)
  { character: 'ガ', romaji: 'ga' },
  { character: 'ギ', romaji: 'gi' },
  { character: 'グ', romaji: 'gu' },
  { character: 'ゲ', romaji: 'ge' },
  { character: 'ゴ', romaji: 'go' },

  // Dakuten - Z row (ザ行)
  { character: 'ザ', romaji: 'za' },
  { character: 'ジ', romaji: 'ji' },
  { character: 'ズ', romaji: 'zu' },
  { character: 'ゼ', romaji: 'ze' },
  { character: 'ゾ', romaji: 'zo' },

  // Dakuten - D row (ダ行)
  { character: 'ダ', romaji: 'da' },
  { character: 'ヂ', romaji: 'ji' },
  { character: 'ヅ', romaji: 'zu' },
  { character: 'デ', romaji: 'de' },
  { character: 'ド', romaji: 'do' },

  // Dakuten - B row (バ行)
  { character: 'バ', romaji: 'ba' },
  { character: 'ビ', romaji: 'bi' },
  { character: 'ブ', romaji: 'bu' },
  { character: 'ベ', romaji: 'be' },
  { character: 'ボ', romaji: 'bo' },

  // Handakuten - P row (パ行)
  { character: 'パ', romaji: 'pa' },
  { character: 'ピ', romaji: 'pi' },
  { character: 'プ', romaji: 'pu' },
  { character: 'ペ', romaji: 'pe' },
  { character: 'ポ', romaji: 'po' },

  // Youon - K combinations (キャ行)
  { character: 'キャ', romaji: 'kya' },
  { character: 'キュ', romaji: 'kyu' },
  { character: 'キョ', romaji: 'kyo' },

  // Youon - S combinations (シャ行)
  { character: 'シャ', romaji: 'sha' },
  { character: 'シュ', romaji: 'shu' },
  { character: 'ショ', romaji: 'sho' },

  // Youon - C combinations (チャ行)
  { character: 'チャ', romaji: 'cha' },
  { character: 'チュ', romaji: 'chu' },
  { character: 'チョ', romaji: 'cho' },

  // Youon - N combinations (ニャ行)
  { character: 'ニャ', romaji: 'nya' },
  { character: 'ニュ', romaji: 'nyu' },
  { character: 'ニョ', romaji: 'nyo' },

  // Youon - H combinations (ヒャ行)
  { character: 'ヒャ', romaji: 'hya' },
  { character: 'ヒュ', romaji: 'hyu' },
  { character: 'ヒョ', romaji: 'hyo' },

  // Youon - M combinations (ミャ行)
  { character: 'ミャ', romaji: 'mya' },
  { character: 'ミュ', romaji: 'myu' },
  { character: 'ミョ', romaji: 'myo' },

  // Youon - R combinations (リャ行)
  { character: 'リャ', romaji: 'rya' },
  { character: 'リュ', romaji: 'ryu' },
  { character: 'リョ', romaji: 'ryo' },

  // Youon - G combinations (ギャ行)
  { character: 'ギャ', romaji: 'gya' },
  { character: 'ギュ', romaji: 'gyu' },
  { character: 'ギョ', romaji: 'gyo' },

  // Youon - J combinations (ジャ行)
  { character: 'ジャ', romaji: 'ja' },
  { character: 'ジュ', romaji: 'ju' },
  { character: 'ジョ', romaji: 'jo' },

  // Youon - B combinations (ビャ行)
  { character: 'ビャ', romaji: 'bya' },
  { character: 'ビュ', romaji: 'byu' },
  { character: 'ビョ', romaji: 'byo' },

  // Youon - P combinations (ピャ行)
  { character: 'ピャ', romaji: 'pya' },
  { character: 'ピュ', romaji: 'pyu' },
  { character: 'ピョ', romaji: 'pyo' },
];

async function seedKana() {
  console.log('🌱 Starting Kana seed...');

  // Find or create a system admin user for creating system decks
  const systemUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!systemUser) {
    console.log('⚠️  No admin user found. Please run this seed after creating an admin user.');
    return;
  }

  const systemUserId = systemUser.id;
  console.log(`📋 Using admin user: ${systemUser.email}`);

  // Check if Hiragana deck already exists
  let hiraganaDeck = await prisma.deck.findFirst({
    where: {
      name: 'Hiragana - ひらがな',
      category: 'Hiragana',
    },
  });

  if (!hiraganaDeck) {
    // Create Hiragana deck
    hiraganaDeck = await prisma.deck.create({
      data: {
        name: 'Hiragana - ひらがな',
        description:
          'Pelajari semua karakter Hiragana dasar, dakuten, handakuten, dan kombinasi youon.',
        category: 'Hiragana',
        difficulty: 'N5',
        isPublic: true,
        createdBy: systemUserId,
        totalCards: hiraganaData.length,
      },
    });
    console.log(`✅ Created Hiragana deck with ${hiraganaData.length} cards`);

    // Create Hiragana flashcards
    await prisma.flashcard.createMany({
      data: hiraganaData.map((kana, index) => ({
        deckId: hiraganaDeck!.id,
        cardType: 'hiragana',
        character: kana.character,
        romaji: kana.romaji,
        position: index,
      })),
    });
    console.log('✅ Hiragana flashcards created');
  } else {
    console.log('⏭️  Hiragana deck already exists, skipping...');
  }

  // Check if Katakana deck already exists
  let katakanaDeck = await prisma.deck.findFirst({
    where: {
      name: 'Katakana - カタカナ',
      category: 'Katakana',
    },
  });

  if (!katakanaDeck) {
    // Create Katakana deck
    katakanaDeck = await prisma.deck.create({
      data: {
        name: 'Katakana - カタカナ',
        description:
          'Pelajari semua karakter Katakana dasar, dakuten, handakuten, dan kombinasi youon.',
        category: 'Katakana',
        difficulty: 'N5',
        isPublic: true,
        createdBy: systemUserId,
        totalCards: katakanaData.length,
      },
    });
    console.log(`✅ Created Katakana deck with ${katakanaData.length} cards`);

    // Create Katakana flashcards
    await prisma.flashcard.createMany({
      data: katakanaData.map((kana, index) => ({
        deckId: katakanaDeck!.id,
        cardType: 'katakana',
        character: kana.character,
        romaji: kana.romaji,
        position: index,
      })),
    });
    console.log('✅ Katakana flashcards created');
  } else {
    console.log('⏭️  Katakana deck already exists, skipping...');
  }

  console.log('🎉 Kana seed completed!');
  console.log(
    `📊 Total: ${hiraganaData.length} Hiragana + ${katakanaData.length} Katakana = ${hiraganaData.length + katakanaData.length} characters`
  );
}

// Main execution
seedKana()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

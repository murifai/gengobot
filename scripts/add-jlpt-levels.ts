/**
 * Add JLPT Levels Script
 *
 * Tags dictionary entries with their JLPT level based on common vocabulary lists.
 *
 * Usage: npx tsx scripts/add-jlpt-levels.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common JLPT vocabulary (curated list)
// These are frequently used words at each level
const JLPT_VOCAB: Record<string, string[]> = {
  N5: [
    // Basic verbs
    'いく',
    '行く',
    'くる',
    '来る',
    'かえる',
    '帰る',
    'たべる',
    '食べる',
    'のむ',
    '飲む',
    'みる',
    '見る',
    'きく',
    '聞く',
    'はなす',
    '話す',
    'よむ',
    '読む',
    'かく',
    '書く',
    'する',
    'ある',
    'いる',
    'なる',
    'できる',
    'わかる',
    '分かる',
    // Basic nouns
    'ひと',
    '人',
    'おとこ',
    '男',
    'おんな',
    '女',
    'こども',
    '子供',
    'ともだち',
    '友達',
    'せんせい',
    '先生',
    'がくせい',
    '学生',
    'いえ',
    '家',
    'へや',
    '部屋',
    'まち',
    '町',
    'くに',
    '国',
    'やま',
    '山',
    'かわ',
    '川',
    'うみ',
    '海',
    'みず',
    '水',
    'ほん',
    '本',
    'しんぶん',
    '新聞',
    'でんわ',
    '電話',
    'くるま',
    '車',
    'えき',
    '駅',
    // Basic adjectives
    'おおきい',
    '大きい',
    'ちいさい',
    '小さい',
    'たかい',
    '高い',
    'やすい',
    '安い',
    'あたらしい',
    '新しい',
    'ふるい',
    '古い',
    'いい',
    'わるい',
    '悪い',
    // Time words
    'いま',
    '今',
    'きょう',
    '今日',
    'あした',
    '明日',
    'きのう',
    '昨日',
    'あさ',
    '朝',
    'ひる',
    '昼',
    'よる',
    '夜',
    'まいにち',
    '毎日',
    // Numbers
    'いち',
    '一',
    'に',
    '二',
    'さん',
    '三',
    'よん',
    '四',
    'ご',
    '五',
    'ろく',
    '六',
    'なな',
    '七',
    'はち',
    '八',
    'きゅう',
    '九',
    'じゅう',
    '十',
  ],
  N4: [
    // Verbs
    'あう',
    '会う',
    'あそぶ',
    '遊ぶ',
    'あらう',
    '洗う',
    'いそぐ',
    '急ぐ',
    'おくる',
    '送る',
    'おしえる',
    '教える',
    'おぼえる',
    '覚える',
    'かりる',
    '借りる',
    'きる',
    '着る',
    'しぬ',
    '死ぬ',
    'すむ',
    '住む',
    'つかう',
    '使う',
    'つくる',
    '作る',
    'てつだう',
    '手伝う',
    'とる',
    '取る',
    'ならう',
    '習う',
    'はじまる',
    '始まる',
    'はたらく',
    '働く',
    'まつ',
    '待つ',
    'もつ',
    '持つ',
    // Nouns
    'かいしゃ',
    '会社',
    'しごと',
    '仕事',
    'せいかつ',
    '生活',
    'じかん',
    '時間',
    'ばしょ',
    '場所',
    'りょこう',
    '旅行',
    'けいざい',
    '経済',
    'しゃかい',
    '社会',
    // Adjectives
    'あぶない',
    '危ない',
    'うれしい',
    'かなしい',
    '悲しい',
    'きびしい',
    '厳しい',
    'すばらしい',
    'たのしい',
    '楽しい',
    'ひどい',
    'めずらしい',
    '珍しい',
  ],
  N3: [
    // Verbs
    'うける',
    '受ける',
    'きまる',
    '決まる',
    'くらべる',
    '比べる',
    'さがす',
    '探す',
    'すすめる',
    '勧める',
    'たすける',
    '助ける',
    'つづける',
    '続ける',
    'ならべる',
    '並べる',
    'のこる',
    '残る',
    'はずす',
    '外す',
    'まもる',
    '守る',
    'みつける',
    '見つける',
    // Nouns
    'かんきょう',
    '環境',
    'げんいん',
    '原因',
    'けっか',
    '結果',
    'しゅるい',
    '種類',
    'じょうほう',
    '情報',
    'せいど',
    '制度',
    'ぶんか',
    '文化',
    'もくてき',
    '目的',
    // Adjectives
    'あきらか',
    '明らか',
    'さかん',
    '盛ん',
    'じゅうよう',
    '重要',
    'ふくざつ',
    '複雑',
  ],
  N2: [
    // Verbs
    'あきらめる',
    '諦める',
    'あてる',
    '当てる',
    'うったえる',
    '訴える',
    'かせぐ',
    '稼ぐ',
    'くずす',
    '崩す',
    'ささえる',
    '支える',
    'しめす',
    '示す',
    'たもつ',
    '保つ',
    'はたす',
    '果たす',
    'ひろげる',
    '広げる',
    'みとめる',
    '認める',
    'やとう',
    '雇う',
    // Nouns
    'いし',
    '意志',
    'えいきょう',
    '影響',
    'かち',
    '価値',
    'きそ',
    '基礎',
    'げんじょう',
    '現状',
    'しんらい',
    '信頼',
    'せきにん',
    '責任',
    'ほうほう',
    '方法',
    // Adjectives
    'おおまか',
    '大まか',
    'かくじつ',
    '確実',
    'けんこう',
    '健康',
    'しんけん',
    '真剣',
  ],
  N1: [
    // Verbs
    'あおぐ',
    '仰ぐ',
    'あざむく',
    '欺く',
    'いどむ',
    '挑む',
    'うやまう',
    '敬う',
    'くつがえす',
    '覆す',
    'さえぎる',
    '遮る',
    'ちかづける',
    '近づける',
    'つちかう',
    '培う',
    'ひきいる',
    '率いる',
    'ほどこす',
    '施す',
    'みちびく',
    '導く',
    'もてなす',
    // Nouns
    'いぎ',
    '意義',
    'かくしん',
    '確信',
    'きょうい',
    '脅威',
    'けんげん',
    '権限',
    'しゅうかん',
    '習慣',
    'せんりゃく',
    '戦略',
    'ぜんてい',
    '前提',
    'ほんしつ',
    '本質',
    // Adjectives
    'あいまい',
    '曖昧',
    'けんめい',
    '賢明',
    'こうみょう',
    '巧妙',
    'しんちょう',
    '慎重',
  ],
};

async function addJlptLevels() {
  console.log('Adding JLPT levels to dictionary entries...');

  let updated = 0;

  for (const [level, words] of Object.entries(JLPT_VOCAB)) {
    console.log(`\nProcessing ${level} (${words.length} words)...`);

    for (const word of words) {
      try {
        const result = await prisma.dictionaryEntry.updateMany({
          where: {
            OR: [{ kanji: { has: word } }, { readings: { has: word } }],
            jlptLevel: null, // Only update if not already set
          },
          data: { jlptLevel: level },
        });

        if (result.count > 0) {
          updated += result.count;
        }
      } catch (error) {
        console.error(`Error updating ${word}:`, error);
      }
    }

    const levelCount = await prisma.dictionaryEntry.count({
      where: { jlptLevel: level },
    });
    console.log(`${level}: ${levelCount} entries tagged`);
  }

  console.log(`\nTotal entries updated: ${updated}`);

  // Show statistics
  const stats = await prisma.dictionaryEntry.groupBy({
    by: ['jlptLevel'],
    _count: true,
    where: { jlptLevel: { not: null } },
  });

  console.log('\nJLPT Level Distribution:');
  for (const stat of stats) {
    console.log(`  ${stat.jlptLevel}: ${stat._count} entries`);
  }
}

async function main() {
  try {
    await addJlptLevels();
  } catch (error) {
    console.error('Failed to add JLPT levels:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

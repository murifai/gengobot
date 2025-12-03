const XLSX = require('xlsx');
const path = require('path');

// Read the Excel files
const candoPath = path.join(__dirname, '../src/data/JFstandard-Cando.xlsx');
const candoWorkbook = XLSX.readFile(candoPath);
const sheet = candoWorkbook.Sheets['JF生活日本語Can-do'];
const rawData = XLSX.utils.sheet_to_json(sheet);

// Map JLPT levels
const levelMapping = {
  A1: 'N5',
  A2: 'N4',
  B1: 'N3',
  B2: 'N2',
  C1: 'N1',
  C2: 'N1',
};

// Category translation mapping - 3 main categories
const categoryTranslation = {
  出かける: 'Keluar Rumah',
  暮らす: 'Kehidupan Sehari-hari',
  働く: 'Bekerja',
};

// Subcategory translation mapping
const subcategoryTranslation = {
  // 出かける (Keluar Rumah)
  交通機関を利用する: 'Menggunakan Transportasi',
  クリーニング店を利用する: 'Menggunakan Jasa Laundry',
  街を歩く: 'Berjalan di Kota',
  飲食店を利用する: 'Makan di Restoran',
  買い物をする: 'Berbelanja',
  娯楽施設を利用する: 'Menggunakan Fasilitas Hiburan',
  観光施設を利用する: 'Mengunjungi Tempat Wisata',
  美容院を利用する: 'Menggunakan Salon',
  '郵便局／銀行を利用する': 'Menggunakan Kantor Pos/Bank',
  公共機関を利用する: 'Menggunakan Fasilitas Publik',
  医療機関を利用する: 'Menggunakan Fasilitas Kesehatan',

  // 暮らす (Kehidupan Sehari-hari)
  会話を円滑に進める: 'Melancarkan Percakapan',
  '地域の行事／活動に参加する': 'Partisipasi Kegiatan Daerah',
  生活の中で聞いたり話したりする: 'Mendengar & Berbicara Sehari-hari',
  '緊急時に備える／対応する': 'Kesiapsiagaan Darurat',
  生活の中で読んだり書いたりする: 'Membaca & Menulis Sehari-hari',
  'テレビを見る／ラジオを聞く': 'Menonton TV/Mendengar Radio',

  // 働く (Bekerja)
  職場で聞いたり話したりする: 'Mendengar & Berbicara di Kantor',
  職場で読んだり書いたりする: 'Membaca & Menulis di Kantor',
};

// Group Cando items by category and subcategory
const groupedData = {};

rawData.forEach(row => {
  const category = row['大カテゴリー'];
  const subcategory = row['小カテゴリー'];
  const level = row['レベル'];
  const candoText = row['JF生活日本語Can-do'];
  const number = row['番号'];

  if (!category || !subcategory || !candoText) return;

  const key = `${category}|${subcategory}`;
  if (!groupedData[key]) {
    groupedData[key] = {
      category,
      subcategory,
      items: [],
    };
  }

  groupedData[key].items.push({
    number,
    level,
    text: candoText,
  });
});

// Sort items within each group by level and number
Object.values(groupedData).forEach(group => {
  group.items.sort((a, b) => {
    const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4 };
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return levelOrder[a.level] - levelOrder[b.level];
    }
    return a.number - b.number;
  });
});

// Generate conversation examples based on subcategory
function generateConversation(candoText, level, subcategory) {
  const conversations = {
    交通機関を利用する: {
      A1: 'A: すみません、この電車は新宿に止まりますか。\nB: はい、止まりますよ。\nA: ありがとうございます。\nB: 3つ目の駅ですよ。',
      A2: 'A: すみません、渋谷駅に行きたいんですが、乗り換えはありますか。\nB: はい、次の駅で山手線に乗り換えてください。\nA: どのくらいかかりますか。\nB: 20分ぐらいですね。',
    },
    クリーニング店を利用する: {
      A1: 'A: いらっしゃいませ。\nB: これをお願いします。\nA: シャツですね。3日後にできます。\nB: わかりました。',
      A2: 'A: いらっしゃいませ。\nB: このジャケットをクリーニングしたいんですが。\nA: しみ抜きもしますか。\nB: はい、お願いします。いつできますか。',
    },
    街を歩く: {
      A1: 'A: すみません、駅はどこですか。\nB: まっすぐ行って、右に曲がってください。\nA: 遠いですか。\nB: 5分ぐらいです。',
      A2: 'A: すみません、この近くにコンビニはありますか。\nB: ありますよ。この道をまっすぐ行って、信号を左に曲がると、右側にあります。\nA: ありがとうございます。\nB: どういたしまして。',
    },
    飲食店を利用する: {
      A1: 'A: いらっしゃいませ。何名様ですか。\nB: 2人です。\nA: こちらへどうぞ。ご注文は？\nB: ラーメンを2つお願いします。',
      A2: 'A: いらっしゃいませ。ご予約はされていますか。\nB: はい、7時に予約した田中です。\nA: 田中様ですね。こちらへどうぞ。\nB: アレルギーがあるんですが、えびは入っていますか。',
    },
    買い物をする: {
      A1: 'A: いらっしゃいませ。\nB: これはいくらですか。\nA: 500円です。\nB: じゃあ、これをください。',
      A2: 'A: いらっしゃいませ。\nB: この服、試着してもいいですか。\nA: はい、試着室はあちらです。\nB: Mサイズはありますか。',
    },
    娯楽施設を利用する: {
      A1: 'A: いらっしゃいませ。\nB: 大人2枚お願いします。\nA: 2000円です。\nB: カードで払えますか。',
      A2: 'A: いらっしゃいませ。映画のチケットですか。\nB: はい、「となりのトトロ」を2枚お願いします。\nA: 何時の回がいいですか。\nB: 午後3時の回はありますか。',
    },
    観光施設を利用する: {
      A1: 'A: いらっしゃいませ。\nB: 入場券を1枚お願いします。\nA: 大人ですか。\nB: はい、大人です。',
      A2: 'A: すみません、ガイドツアーはありますか。\nB: はい、日本語と英語のツアーがあります。\nA: 英語のツアーは何時からですか。\nB: 次は2時からです。',
    },
    美容院を利用する: {
      A1: 'A: いらっしゃいませ。予約はありますか。\nB: いいえ、今日できますか。\nA: はい、大丈夫です。\nB: カットをお願いします。',
      A2: 'A: 今日はどうなさいますか。\nB: 少し短くしてください。\nA: どのくらい切りますか。\nB: 3センチぐらいお願いします。前髪も少し。',
    },
    '郵便局／銀行を利用する': {
      A1: 'A: いらっしゃいませ。\nB: この手紙を送りたいです。\nA: どこへ送りますか。\nB: インドネシアです。',
      A2: 'A: いらっしゃいませ。\nB: 口座を開きたいんですが。\nA: 在留カードとパスポートをお持ちですか。\nB: はい、あります。どのくらい時間がかかりますか。',
    },
    公共機関を利用する: {
      A1: 'A: すみません、図書館はどこですか。\nB: 2階です。\nA: 何時まで開いていますか。\nB: 5時までです。',
      A2: 'A: すみません、本を借りたいんですが。\nB: カードはお持ちですか。\nA: いいえ、まだです。\nB: では、こちらで登録してください。身分証明書が必要です。',
    },
    医療機関を利用する: {
      A1: 'A: どうしましたか。\nB: 頭が痛いです。\nA: いつからですか。\nB: 昨日からです。',
      A2: 'A: 今日はどうされましたか。\nB: 昨日から熱があって、のども痛いんです。\nA: 熱は何度ありますか。\nB: 38度5分ぐらいです。薬のアレルギーはありません。',
    },
    会話を円滑に進める: {
      A1: 'A: すみません、もう一度言ってください。\nB: はい、ゆっくり話しますね。\nA: ありがとうございます。\nB: わかりましたか。',
      A2: 'A: すみません、今の言葉の意味がわからないんですが。\nB: ああ、「締め切り」ですか。これは「最後の日」という意味です。\nA: ああ、なるほど。ありがとうございます。\nB: 何でも聞いてくださいね。',
    },
    '地域の行事／活動に参加する': {
      A1: 'A: 日曜日、お祭りがありますよ。\nB: へえ、何時からですか。\nA: 10時からです。\nB: 行きたいです。',
      A2: 'A: 来週の土曜日、町内会の掃除があるんですが、参加できますか。\nB: 何時からですか。\nA: 朝8時から10時までです。\nB: はい、大丈夫です。何を持って行けばいいですか。',
    },
    生活の中で聞いたり話したりする: {
      A1: 'A: 今日、いい天気ですね。\nB: そうですね。\nA: 週末、何をしますか。\nB: 買い物に行きます。',
      A2: 'A: 最近、どうですか。\nB: おかげさまで、元気です。仕事も慣れてきました。\nA: それはよかったですね。\nB: はい、みなさんが親切で助かっています。',
    },
    '緊急時に備える／対応する': {
      A1: 'A: 地震です！\nB: 机の下に隠れてください。\nA: わかりました。\nB: 大丈夫ですか。',
      A2: 'A: 火事です！119番に電話してください。\nB: もしもし、火事です。住所は東京都新宿区1-1-1です。\nA: わかりました。すぐ向かいます。\nB: お願いします。',
    },
    生活の中で読んだり書いたりする: {
      A1: 'A: この漢字は何ですか。\nB: 「出口」です。Exit の意味です。\nA: ありがとうございます。\nB: こちらが出口ですよ。',
      A2: 'A: すみません、この書類の書き方がわからないんですが。\nB: どこがわかりませんか。\nA: この欄に何を書けばいいですか。\nB: ここには住所を書いてください。',
    },
    'テレビを見る／ラジオを聞く': {
      A1: 'A: 明日は雨です。\nB: 傘を持って行かなきゃ。\nA: 気温は15度です。\nB: 少し寒いですね。',
      A2: 'A: ニュースを見ましたか。\nB: はい、昨日の台風のニュースを見ました。\nA: 被害は大きかったですね。\nB: そうですね。電車も止まっていたみたいです。',
    },
    職場で聞いたり話したりする: {
      A1: 'A: おはようございます。\nB: おはようございます。\nA: 今日の予定は？\nB: 10時に会議があります。',
      A2: 'A: すみません、明日休みをいただきたいんですが。\nB: どうしましたか。\nA: 病院に行かなければならないんです。\nB: わかりました。午前中だけでも出られますか。',
    },
    職場で読んだり書いたりする: {
      A1: 'A: このメールを読んでください。\nB: はい、わかりました。\nA: 返事を書いてください。\nB: はい。',
      A2: 'A: この報告書を確認してもらえますか。\nB: はい、少々お待ちください。\nA: 何か問題がありますか。\nB: ここの日付が違っていますね。修正してください。',
    },
  };

  const conv = conversations[subcategory];
  if (conv) {
    return conv[level] || conv['A1'] || conv['A2'];
  }

  // Default conversation
  return 'A: すみません、ちょっといいですか。\nB: はい、何でしょうか。\nA: 教えていただけますか。\nB: はい、もちろんです。';
}

// Create import data
const importData = [];
let taskNumber = 1;

// Process each group and create tasks
Object.entries(groupedData).forEach(([key, group]) => {
  const { category, subcategory, items } = group;

  // Group items by level
  const itemsByLevel = {};
  items.forEach(item => {
    if (!itemsByLevel[item.level]) {
      itemsByLevel[item.level] = [];
    }
    itemsByLevel[item.level].push(item);
  });

  // Create tasks for each level
  Object.entries(itemsByLevel).forEach(([level, levelItems]) => {
    // Group similar cando items (max 3 per task for better focus)
    const chunks = [];
    let currentChunk = [];

    levelItems.forEach((item, index) => {
      currentChunk.push(item);
      if (currentChunk.length >= 3 || index === levelItems.length - 1) {
        chunks.push([...currentChunk]);
        currentChunk = [];
      }
    });

    chunks.forEach((chunk, chunkIndex) => {
      const mainCando = chunk[0];
      const translatedSubcat = subcategoryTranslation[subcategory] || subcategory;
      const translatedCat = categoryTranslation[category] || category;

      // Create title in Indonesian
      const title = `${translatedSubcat} - Bagian ${chunkIndex + 1}`;

      // Create description in Indonesian
      const description = `Latihan percakapan tentang ${translatedSubcat.toLowerCase()} dalam konteks ${translatedCat.toLowerCase()} di Jepang. Level ${level} (${levelMapping[level]}).`;

      // Create learning objectives in Indonesian
      const learningObjectives = chunk
        .map((c, idx) => {
          // Simplify and translate to Indonesian
          let obj = c.text.trim();
          // Remove trailing できる pattern
          obj = obj.replace(/ことができる。?$/, '');
          obj = obj.replace(/できる。?$/, '');
          // Truncate if too long
          if (obj.length > 80) {
            obj = obj.substring(0, 80) + '...';
          }
          return `Dapat ${obj}`;
        })
        .join(', ');

      // Create scenario/prompt in English
      const scenario = `You are practicing ${translatedSubcat} conversation at ${level} level (${levelMapping[level]}).

Context: The learner needs to practice the following skills:
${chunk.map((c, idx) => `${idx + 1}. ${c.text}`).join('\n')}

Role-play a realistic conversation helping the learner achieve these goals. Start the conversation and guide them through the interaction.`;

      // Generate conversation example with A/B format
      const conversationExample = generateConversation(mainCando.text, level, subcategory);

      importData.push({
        title: title,
        description: description,
        category: translatedCat,
        subcategoryId: '',
        difficulty: levelMapping[level] || 'N5',
        scenario: scenario,
        learningObjectives: learningObjectives,
        conversationExample: conversationExample,
        estimatedDuration: level === 'A1' ? 10 : level === 'A2' ? 15 : 20,
        prerequisites:
          level === 'A1' ? 'Dasar hiragana dan katakana' : 'Menguasai level sebelumnya',
        characterId: '',
        isActive: 'TRUE',
        originalCandoNumbers: chunk.map(c => c.number).join(', '),
        originalLevel: level,
      });

      taskNumber++;
    });
  });
});

// Sort by category, subcategory and difficulty
const catOrder = ['Keluar Rumah', 'Kehidupan Sehari-hari', 'Bekerja'];
const diffOrder = ['N5', 'N4', 'N3', 'N2', 'N1'];

importData.sort((a, b) => {
  const catA = catOrder.indexOf(a.category);
  const catB = catOrder.indexOf(b.category);
  if (catA !== catB) return catA - catB;

  const diffA = diffOrder.indexOf(a.difficulty);
  const diffB = diffOrder.indexOf(b.difficulty);
  return diffA - diffB;
});

// Create workbook
const ws = XLSX.utils.json_to_sheet(importData);

// Set column widths
ws['!cols'] = [
  { wch: 45 }, // title
  { wch: 70 }, // description
  { wch: 25 }, // category
  { wch: 15 }, // subcategoryId
  { wch: 10 }, // difficulty
  { wch: 100 }, // scenario
  { wch: 120 }, // learningObjectives
  { wch: 80 }, // conversationExample
  { wch: 15 }, // estimatedDuration
  { wch: 35 }, // prerequisites
  { wch: 15 }, // characterId
  { wch: 10 }, // isActive
  { wch: 25 }, // originalCandoNumbers
  { wch: 12 }, // originalLevel
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

// Add instructions sheet
const instructionsData = [
  {
    Field: 'title',
    Description: 'Judul task (wajib)',
    Example: 'Menggunakan Transportasi - Bagian 1',
    Notes: 'Singkat dan deskriptif',
  },
  {
    Field: 'description',
    Description: 'Deskripsi detail (wajib)',
    Example: 'Latihan percakapan tentang transportasi...',
    Notes: 'Dalam bahasa Indonesia',
  },
  {
    Field: 'category',
    Description: 'Kategori task (wajib)',
    Example: 'Keluar Rumah',
    Notes: '3 kategori: Keluar Rumah, Kehidupan Sehari-hari, Bekerja',
  },
  {
    Field: 'subcategoryId',
    Description: 'ID subkategori (opsional)',
    Example: 'clx123abc',
    Notes: 'Kosongkan jika tidak ada',
  },
  {
    Field: 'difficulty',
    Description: 'Level JLPT (wajib)',
    Example: 'N5',
    Notes: 'N5, N4, N3, N2, atau N1',
  },
  {
    Field: 'scenario',
    Description: 'Prompt untuk AI (wajib)',
    Example: 'You are practicing...',
    Notes: 'Dalam bahasa Inggris',
  },
  {
    Field: 'learningObjectives',
    Description: 'Tujuan pembelajaran (wajib)',
    Example: 'Dapat menanyakan arah, Dapat membeli tiket',
    Notes: 'Pisahkan dengan koma',
  },
  {
    Field: 'conversationExample',
    Description: 'Contoh percakapan (wajib)',
    Example: 'A: すみません\\nB: はい',
    Notes: 'Format A/B, gunakan \\n untuk baris baru',
  },
  {
    Field: 'estimatedDuration',
    Description: 'Durasi dalam menit (opsional)',
    Example: '10',
    Notes: 'Angka saja',
  },
  {
    Field: 'prerequisites',
    Description: 'Prasyarat (opsional)',
    Example: 'Dasar hiragana',
    Notes: 'Pisahkan dengan koma',
  },
  {
    Field: 'characterId',
    Description: 'ID karakter (opsional)',
    Example: 'clx456def',
    Notes: 'Kosongkan untuk default',
  },
  {
    Field: 'isActive',
    Description: 'Status aktif (opsional)',
    Example: 'TRUE',
    Notes: 'TRUE atau FALSE',
  },
  {
    Field: 'originalCandoNumbers',
    Description: 'Nomor Cando asli',
    Example: '1, 2, 3',
    Notes: 'Untuk referensi',
  },
  { Field: 'originalLevel', Description: 'Level asli', Example: 'A1', Notes: 'A1 atau A2' },
];

const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
wsInstructions['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 50 }, { wch: 50 }];
XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk');

// Write output file
const outputPath = path.join(__dirname, '../src/data/cando_import.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Generated ${importData.length} tasks`);
console.log(`Output saved to: ${outputPath}`);

// Print summary
console.log('\n=== Summary by Category ===');
const catSummary = {};
importData.forEach(task => {
  if (!catSummary[task.category]) {
    catSummary[task.category] = { N5: 0, N4: 0, N3: 0, total: 0 };
  }
  catSummary[task.category][task.difficulty]++;
  catSummary[task.category].total++;
});

Object.entries(catSummary).forEach(([cat, counts]) => {
  console.log(`\n${cat}:`);
  console.log(`  N5: ${counts.N5} tasks`);
  console.log(`  N4: ${counts.N4} tasks`);
  console.log(`  Total: ${counts.total} tasks`);
});

// Print sample tasks
console.log('\n=== Sample Tasks ===');
importData.slice(0, 3).forEach((task, idx) => {
  console.log(`\nTask ${idx + 1}:`);
  console.log(`  Title: ${task.title}`);
  console.log(`  Category: ${task.category}`);
  console.log(`  Difficulty: ${task.difficulty}`);
  console.log(`  Description: ${task.description.substring(0, 80)}...`);
});

// Auto-generated from database export
// Generated at: 2025-12-09T14:24:53.455Z

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tasksData = [
  {
    id: 'cmipqkuv000gw13atsspg7d09',
    title: 'Berbelanja: Bertanya Harga dan Lokasi Barang',
    description:
      'Latihan bertanya harga barang, lokasi produk di toko, dan meminta bantuan pramuniaga.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg970002dkul86qgo32g',
    difficulty: 'N4',
    scenario:
      'Kamu sedang berbelanja dan perlu bertanya kepada staf tentang harga dan lokasi produk tertentu.',
    learningObjectives: [
      'Bertanya harga dengan sopan',
      'Bertanya lokasi barang di toko',
      'Memahami petunjuk lokasi dari pramuniaga',
      'Memanggil pramuniaga dengan sopan',
    ],
    conversationExample:
      'A: すみません、これはいくらですか？\r\nB: 1,500円です。\r\nA: パンはどこにありますか？\r\nB: 2階にあります。\r\nA: ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a helpful shop staff in a Japanese store.\r\nYour role is to assist customers find products and provide price information.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give clear price information\r\n- Explain product locations simply\r\n- Be friendly and helpful',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv400gz13atv6k8hl7i',
    title: 'Check-in dan Bertanya Fasilitas Hotel',
    description: 'Latihan check-in di hotel dan bertanya tentang fasilitas yang tersedia.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9j0006dkulhu3uepqu',
    difficulty: 'N4',
    scenario:
      'Kamu sedang check-in di hotel. Konfirmasi reservasi dan tanyakan tentang fasilitas hotel.',
    learningObjectives: [
      'Melakukan check-in hotel',
      'Mengonfirmasi reservasi',
      'Bertanya tentang fasilitas hotel',
      'Memahami penjelasan fasilitas',
    ],
    conversationExample:
      'A: 予約した田中です。\r\nB: 田中様ですね。3泊ですね。\r\nA: WiFiはありますか？\r\nB: はい、無料で使えます。\r\nA: 朝ご飯は何時からですか？\r\nB: 7時からです。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a hotel front desk staff in Japan.\r\nYour role is to check in guests and answer questions about facilities.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Confirm reservation details\r\n- Explain hotel facilities clearly\r\n- Be welcoming and professional',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv500h013atw1u18sh1',
    title: 'Membeli Tiket di Tempat Hiburan',
    description: 'Latihan membeli tiket di bioskop, museum, atau taman hiburan.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9m000edkuld3pefdjs',
    difficulty: 'N4',
    scenario: 'Kamu berada di bioskop atau taman hiburan dan ingin membeli tiket.',
    learningObjectives: [
      'Membeli tiket hiburan',
      'Menyebutkan jumlah tiket dan film/atraksi',
      'Bertanya jadwal pertunjukan',
      'Menggunakan counter untuk tiket',
    ],
    conversationExample:
      'A: 「となりのトトロ」のチケット、2枚ください。\r\nB: 何時の回がよろしいですか？\r\nA: 3時からのをお願いします。\r\nB: 2,400円です。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a ticket booth staff at a cinema or amusement park.\r\nYour role is to sell tickets to customers.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask about showtime preferences\r\n- Confirm the number of tickets\r\n- Process transactions efficiently',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuuy00gv13at41hdheny',
    title: 'Reservasi Restoran via Telepon',
    description:
      'Latihan membuat reservasi restoran melalui telepon, menyebutkan tanggal, waktu, dan jumlah orang.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9l000cdkul1qsxhzjy',
    difficulty: 'N4',
    scenario:
      'Kamu ingin membuat reservasi makan malam di restoran melalui telepon. Sampaikan nama, tanggal, waktu, dan jumlah orang.',
    learningObjectives: [
      'Membuat reservasi restoran',
      'Menyebutkan tanggal dan waktu',
      'Menyebutkan jumlah orang',
      'Memberikan nama untuk reservasi',
    ],
    conversationExample:
      'A: もしもし、予約をしたいんですが。\r\nB: はい、いつがよろしいですか？\r\nA: 土曜日の7時に3人でお願いします。\r\nB: お名前をお願いします。\r\nA: 田中です。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a restaurant staff taking phone reservations.\r\nYour role is to book tables for customers.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Ask for date, time, and party size\r\n- Confirm the reservation details\r\n- Be professional and courteous',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv100gx13atou58alwi',
    title: 'Berbelanja Pakaian: Mencoba dan Memilih',
    description:
      'Latihan berbelanja pakaian, termasuk meminta untuk mencoba, bertanya ukuran dan warna lain.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg970002dkul86qgo32g',
    difficulty: 'N5',
    scenario: 'Kamu ingin mencoba pakaian dan bertanya apakah tersedia ukuran atau warna lain.',
    learningObjectives: [
      'Meminta izin mencoba pakaian',
      'Bertanya ketersediaan ukuran lain',
      'Bertanya ketersediaan warna lain',
      'Menggunakan てもいいですか',
    ],
    conversationExample:
      'A: すみません、これ、着てみてもいいですか？\r\nB: はい、どうぞ。試着室はあちらです。\r\nA: Mサイズはありますか？\r\nB: はい、あります。\r\nA: 他の色はありますか？\r\nB: 黒と白があります。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a clothing store staff in Japan.\r\nYour role is to help customers try on clothes and find the right size/color.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Guide customers to fitting rooms\r\n- Offer size and color alternatives\r\n- Be attentive and helpful',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuut00gs13atxyhssd5a',
    title: 'Bertanya Arah dan Petunjuk Jalan',
    description:
      'Latihan bertanya arah jalan dan memahami petunjuk sederhana seperti belok kanan, belok kiri, lurus, dll.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9l000adkul3ozl2qgm',
    difficulty: 'N5',
    scenario:
      'Kamu tersesat dan perlu bertanya kepada orang sekitar tentang arah ke stasiun. Pahami dan ikuti petunjuk sederhana.',
    learningObjectives: [
      'Bertanya keberadaan tempat di sekitar',
      'Memahami petunjuk arah sederhana',
      'Menggunakan ungkapan この近くに～がありますか',
      'Memahami kata 右 左 まっすぐ',
    ],
    conversationExample:
      'A: すみません、この近くに駅がありますか？\r\nB: はい、あります。まっすぐ行って、右に曲がってください。\r\nA: まっすぐ行って、右ですね。ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friendly local person on a Japanese street.\r\nYour role is to help tourists find their way.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give simple, clear directions\r\n- Use basic direction words (右、左、まっすぐ)\r\n- Be patient and helpful',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv300gy13at8v5vtas0',
    title: 'Bertanya di Pusat Informasi Wisata',
    description:
      'Latihan bertanya informasi wisata di pusat informasi, termasuk tempat makan, transportasi, dan rekomendasi tempat.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9m000edkuld3pefdjs',
    difficulty: 'N5',
    scenario:
      'Kamu berada di pusat informasi wisata dan ingin bertanya tentang tempat wisata, restoran lokal, dan transportasi.',
    learningObjectives: [
      'Bertanya rekomendasi tempat wisata',
      'Bertanya tentang makanan khas lokal',
      'Bertanya cara ke tempat wisata',
      'Memahami jawaban informasi wisata',
    ],
    conversationExample:
      'A: すみません、この辺でおいしいお店はありますか？\r\nB: 駅の近くにラーメン屋があります。\r\nA: お城までどうやって行きますか？\r\nB: バスで20分ぐらいです。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friendly tourist information center staff.\r\nYour role is to help tourists explore the area.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Recommend local attractions and restaurants\r\n- Explain transportation options\r\n- Be enthusiastic and helpful',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv600h113atqo0sexpf',
    title: 'Check-in di Bandara',
    description: 'Latihan check-in di bandara, menyerahkan paspor, dan memilih kursi pesawat.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9i0004dkulgcdie73f',
    difficulty: 'N5',
    scenario:
      'Kamu berada di counter check-in bandara. Serahkan paspor dan tiket, serta pilih kursi yang kamu inginkan.',
    learningObjectives: [
      'Melakukan check-in di bandara',
      'Menyerahkan dokumen perjalanan',
      'Memilih kursi pesawat',
      'Memahami pertanyaan petugas',
    ],
    conversationExample:
      'A: パスポートとチケットをお願いします。\r\nB: はい、どうぞ。\r\nA: 窓側と通路側、どちらがよろしいですか？\r\nB: 窓側をお願いします。\r\nA: お荷物はいくつありますか？\r\nB: 1つです。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are an airline check-in counter staff at a Japanese airport.\r\nYour role is to help passengers check in for their flights.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Ask for passport and ticket\r\n- Offer seat preferences\r\n- Ask about luggage',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv700h213atixkqitsk',
    title: 'Melewati Imigrasi di Bandara',
    description:
      'Latihan menjawab pertanyaan petugas imigrasi tentang tujuan kunjungan dan lama tinggal.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9i0004dkulgcdie73f',
    difficulty: 'N5',
    scenario:
      'Kamu melewati imigrasi di Jepang. Jawab pertanyaan petugas tentang tujuan dan lama kunjunganmu.',
    learningObjectives: [
      'Menjawab pertanyaan imigrasi',
      'Menyebutkan tujuan kunjungan',
      'Menyebutkan lama tinggal',
      'Memahami pertanyaan dasar imigrasi',
    ],
    conversationExample:
      'A: 旅行の目的は何ですか？\r\nB: 観光です。\r\nA: どのくらい滞在しますか？\r\nB: 1週間です。\r\nA: どこに泊まりますか？\r\nB: 東京のホテルです。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are an immigration officer at a Japanese airport.\r\nYour role is to ask basic entry questions to visitors.\r\n\r\nGuidelines:\r\n- Use polite but formal Japanese\r\n- Ask about purpose of visit\r\n- Ask about length of stay\r\n- Be professional',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuur00gr13at0bb2fqkt',
    title: 'Membeli Tiket Shinkansen',
    description:
      'Latihan membeli tiket shinkansen atau kereta ekspres di loket stasiun, termasuk menyebutkan tujuan dan jumlah tiket.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9k0008dkulw3i0gvnt',
    difficulty: 'N5',
    scenario:
      'Kamu berada di loket tiket dan ingin membeli tiket Shinkansen ke Osaka. Sebutkan jumlah tiket dan jawab pertanyaan petugas.',
    learningObjectives: [
      'Membeli tiket di loket stasiun',
      'Menyebutkan tujuan dan jumlah tiket',
      'Menjawab pertanyaan petugas tentang detail tiket',
      'Menggunakan counter untuk tiket (枚)',
    ],
    conversationExample:
      'A: 大阪まで2枚お願いします。\r\nB: 指定席ですか、自由席ですか？\r\nA: 指定席でお願いします。\r\nB: 片道ですか、往復ですか？\r\nA: 片道です。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a ticket counter staff at a Japanese train station.\r\nYour role is to help customers purchase Shinkansen tickets.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Ask about seat type (reserved/unreserved)\r\n- Ask about one-way or round trip\r\n- Confirm the order clearly',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuuu00gt13ato17tp0jg',
    title: 'Memesan Makanan di Restoran',
    description:
      'Latihan memesan makanan dan minuman di restoran, termasuk bertanya tentang menu dan menyampaikan preferensi.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9l000cdkul1qsxhzjy',
    difficulty: 'N5',
    scenario:
      'Kamu berada di restoran dan ingin memesan makanan. Tanyakan rekomendasi dan sampaikan pesananmu.',
    learningObjectives: [
      'Memesan makanan dengan sopan',
      'Bertanya rekomendasi kepada pelayan',
      'Menyatakan pilihan menggunakan ～にします',
      'Memahami pertanyaan pelayan',
    ],
    conversationExample:
      'A: すみません、おすすめは何ですか？\r\nB: 今日は天ぷらがおすすめです。\r\nA: じゃ、天ぷら定食にします。\r\nB: お飲み物はいかがですか？\r\nA: お茶をお願いします。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a polite waiter/waitress at a Japanese restaurant.\r\nYour role is to take orders and help customers choose dishes.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Recommend dishes when asked\r\n- Ask about drinks\r\n- Confirm orders clearly',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuuw00gu13atec6vkiju',
    title: 'Menyatakan Preferensi dan Alergi Makanan',
    description:
      'Latihan bertanya tentang bahan makanan, menyatakan alergi atau pantangan, dan meminta modifikasi pesanan.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9l000cdkul1qsxhzjy',
    difficulty: 'N5',
    scenario:
      'Kamu memiliki pantangan makanan dan perlu bertanya tentang bahan dalam hidangan. Minta modifikasi jika diperlukan.',
    learningObjectives: [
      'Bertanya tentang bahan makanan',
      'Menyatakan pantangan atau alergi',
      'Meminta modifikasi pesanan',
      'Menggunakan ～抜きでお願いします',
    ],
    conversationExample:
      'A: すみません、これは何が入っていますか？\r\nB: 卵と野菜が入っています。\r\nA: 卵は食べられません。卵抜きでできますか？\r\nB: はい、大丈夫です。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are an understanding restaurant staff in Japan.\r\nYour role is to help customers with dietary restrictions.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Explain ingredients clearly\r\n- Accommodate special requests when possible\r\n- Be patient and helpful',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuun00gq13atksibhuxq',
    title: 'Naik Bus: Konfirmasi Halte',
    description:
      'Latihan berkomunikasi saat naik bus, termasuk bertanya halte tujuan, mengonfirmasi pemberhentian, dan menyatakan ingin turun.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9k0008dkulw3i0gvnt',
    difficulty: 'N5',
    scenario:
      'Kamu naik bus dan perlu mengonfirmasi apakah bus ini berhenti di tujuanmu. Latihan juga menyatakan kamu ingin turun.',
    learningObjectives: [
      'Bertanya apakah bus berhenti di halte tertentu',
      'Mengonfirmasi halte saat ini atau berikutnya',
      'Menyatakan ingin turun dengan sopan',
      'Memahami pengumuman sederhana di bus',
    ],
    conversationExample:
      'A: すみません、このバスは渋谷に止まりますか？\r\nB: はい、止まりますよ。\r\nA: 次は渋谷ですか？\r\nB: はい、次です。\r\nA: 降ります。すみません。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friendly bus driver or a helpful passenger on a Japanese bus.\r\nYour role is to help other passengers with stop information.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give clear information about bus stops\r\n- Be patient with questions\r\n- Speak at a moderate pace',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuum00gp13at2zmqgdri',
    title: 'Naik Taksi: Menyampaikan Tujuan',
    description:
      'Latihan berkomunikasi dengan sopir taksi, termasuk menyampaikan tujuan, bertanya waktu tempuh, dan menyatakan tempat turun.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9l000adkul3ozl2qgm',
    difficulty: 'N5',
    scenario:
      'Kamu naik taksi dan perlu menyampaikan tujuan kepada sopir, bertanya berapa lama perjalanan, dan memberitahu di mana kamu ingin turun.',
    learningObjectives: [
      'Menyampaikan tujuan kepada sopir taksi',
      'Bertanya waktu tempuh perjalanan',
      'Menyatakan tempat untuk turun',
      'Menggunakan ungkapan ～までお願いします',
    ],
    conversationExample:
      'A: 東京駅までお願いします。\r\nB: はい、わかりました。\r\nA: どのくらいかかりますか？\r\nB: 20分ぐらいです。\r\nA: ここでいいです。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friendly Japanese taxi driver.\r\nYour role is to help passengers get to their destination.\r\n\r\nGuidelines:\r\n- Use polite but casual Japanese\r\n- Confirm the destination clearly\r\n- Answer questions about time and routes\r\n- Be helpful and patient',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuuh00go13atdstfeoto',
    title: 'Transportasi Umum: Bertanya di Stasiun',
    description:
      'Latihan bertanya dan memahami informasi di stasiun kereta. Termasuk cara bertanya platform, tujuan kereta, dan harga tiket.',
    category: 'Jalan-jalan',
    subcategoryId: 'cmipplg9k0008dkulw3i0gvnt',
    difficulty: 'N5',
    scenario:
      'Kamu berada di stasiun kereta dan perlu bertanya platform keberangkatan serta apakah kereta berhenti di tujuanmu.',
    learningObjectives: [
      'Bertanya platform kereta dengan sopan',
      'Memahami jawaban tentang nomor platform',
      'Bertanya apakah kereta berhenti di tujuan',
      'Menggunakan partikel は dan が dengan benar',
    ],
    conversationExample:
      'A: すみません、東京行きは何番線ですか？\r\nB: 3番線です。\r\nA: この電車は新宿に止まりますか？\r\nB: はい、止まりますよ。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a helpful train station staff member in Japan.\r\nYour role is to help passengers find their trains and platforms.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Be patient and speak clearly\r\n- Give simple, direct answers\r\n- Help with basic train information',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvs00hj13at1yxoam1x',
    title: 'Berbicara dengan Teman Sekelas',
    description: 'Latihan berbicara dengan teman sekelas tentang pelajaran dan kegiatan sekolah.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9v000xdkulrs59tnnr',
    difficulty: 'N4',
    scenario:
      'Kamu berbicara dengan teman sekelas tentang pelajaran hari ini dan tugas yang diberikan.',
    learningObjectives: [
      'Berbicara tentang jadwal pelajaran',
      'Bertanya tentang tugas',
      'Mengajak belajar bersama',
      'Memahami informasi kelas',
    ],
    conversationExample:
      'A: 今日の宿題、何ですか？\r\nB: 数学のプリントです。\r\nA: 難しいですね。一緒に勉強しませんか？\r\nB: いいですね。図書館で勉強しましょう。\r\nA: 何時に会いますか？\r\nB: 3時はどうですか？',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a classmate discussing school work.\r\nYour role is to talk about classes and homework.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Discuss homework and classes\r\n- Suggest studying together\r\n- Be friendly and helpful',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvb00h513atqxngv0nt',
    title: 'Berbicara tentang Hobi dan Minat',
    description: 'Latihan berbicara tentang hobi dan kegiatan yang disukai.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9q000ldkul91s0fxkx',
    difficulty: 'N4',
    scenario:
      'Kamu mengobrol dengan teman baru tentang hobi. Bagikan apa yang kamu sukai dan tanyakan tentang minat mereka.',
    learningObjectives: [
      'Menyatakan hobi dengan 趣味は～です',
      'Bertanya tentang hobi orang lain',
      'Menggunakan が好きです untuk menyatakan kesukaan',
      'Berbicara tentang kegiatan waktu luang',
    ],
    conversationExample:
      'A: 趣味は何ですか？\r\nB: 映画を見ることです。Aさんは？\r\nA: 私は料理が好きです。週末によく作ります。\r\nB: いいですね。どんな料理を作りますか？\r\nA: インドネシア料理をよく作ります。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friendly person chatting about hobbies.\r\nYour role is to share interests and learn about others.\r\n\r\nGuidelines:\r\n- Use casual but polite Japanese\r\n- Share your own hobbies\r\n- Ask follow-up questions\r\n- Show enthusiasm about shared interests',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvr00hi13atgv1txm6o',
    title: 'Berbicara tentang Olahraga Favorit',
    description: 'Latihan berbicara tentang olahraga yang disukai dan kebiasaan berolahraga.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9t000tdkulbpo6gxgl',
    difficulty: 'N4',
    scenario: 'Kamu berbicara dengan teman tentang olahraga favorit dan kebiasaan berolahraga.',
    learningObjectives: [
      'Menyatakan olahraga favorit',
      'Berbicara tentang frekuensi olahraga',
      'Mengajak berolahraga bersama',
      'Menggunakan ～をします untuk olahraga',
    ],
    conversationExample:
      'A: 何かスポーツをしますか？\r\nB: はい、サッカーをします。週に2回練習します。\r\nA: いいですね。私はテニスが好きです。\r\nB: 今度、一緒にテニスをしませんか？\r\nA: いいですね。やりましょう。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friend who enjoys sports.\r\nYour role is to discuss sports and invite others to play.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Share your sports habits\r\n- Invite to play together\r\n- Be enthusiastic',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvm00hd13at2l4i4hpa',
    title: 'Bertanya Aturan Pembuangan Sampah',
    description: 'Latihan bertanya kepada tetangga tentang aturan pembuangan sampah.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9p000jdkulchexa66a',
    difficulty: 'N4',
    scenario:
      'Kamu baru pindah ke apartemen baru dan perlu bertanya kepada tetangga tentang aturan pembuangan sampah.',
    learningObjectives: [
      'Bertanya jadwal pembuangan sampah',
      'Memahami jenis-jenis sampah',
      'Memahami aturan pemilahan sampah',
      'Menggunakan ～は何曜日ですか',
    ],
    conversationExample:
      'A: すみません、燃えるゴミは何曜日に出しますか？\r\nB: 月曜日と木曜日です。\r\nA: プラスチックは？\r\nB: 水曜日です。朝8時までに出してください。\r\nA: わかりました。ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a helpful neighbor explaining garbage rules.\r\nYour role is to explain trash disposal schedules.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Explain different garbage days\r\n- Mention time restrictions\r\n- Be patient with new residents',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvt00hk13atmhet7ish',
    title: 'Memasak Bersama Teman',
    description:
      'Latihan berkomunikasi saat memasak bersama, termasuk memberi instruksi dan bertanya resep.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9s000rdkulat0ihgou',
    difficulty: 'N4',
    scenario:
      'Kamu memasak bersama teman. Latihan memberi dan menerima instruksi memasak sederhana.',
    learningObjectives: [
      'Memberikan instruksi memasak sederhana',
      'Bertanya tentang bahan',
      'Menggunakan ～てください untuk instruksi',
      'Menjelaskan cara memasak',
    ],
    conversationExample:
      'A: 次は何をしますか？\r\nB: 野菜を切ってください。\r\nA: どのくらいの大きさに切りますか？\r\nB: 小さく切ってください。\r\nA: わかりました。\r\nB: 次に、フライパンで炒めてください。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friend cooking together in the kitchen.\r\nYour role is to give and receive cooking instructions.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Give step-by-step instructions\r\n- Be patient with questions\r\n- Make cooking fun',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvj00hb13atiamtcg33',
    title: 'Membeli Obat di Apotek',
    description: 'Latihan membeli obat di apotek dan memahami instruksi penggunaan obat.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9s000pdkul7lpvlp5v',
    difficulty: 'N4',
    scenario:
      'Kamu berada di apotek dan perlu membeli obat flu. Minta rekomendasi dan pahami instruksi penggunaan.',
    learningObjectives: [
      'Menyatakan gejala kepada apoteker',
      'Memahami instruksi penggunaan obat',
      'Bertanya tentang dosis obat',
      'Menggunakan ～てください untuk instruksi',
    ],
    conversationExample:
      'A: 風邪の薬をください。\r\nB: どんな症状ですか？\r\nA: 熱と咳があります。\r\nB: この薬がいいですよ。1日3回、食後に飲んでください。\r\nA: わかりました。ありがとうございます。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a helpful pharmacist in Japan.\r\nYour role is to recommend medicine and explain usage.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask about symptoms\r\n- Recommend appropriate medicine\r\n- Explain dosage clearly',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvq00hh13atqqvojxzw',
    title: 'Mendaftar di Gym',
    description: 'Latihan mendaftar keanggotaan gym dan bertanya tentang fasilitas.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9r000ndkulswfko93u',
    difficulty: 'N4',
    scenario:
      'Kamu ingin mendaftar di gym. Tanyakan tentang biaya keanggotaan dan fasilitas yang tersedia.',
    learningObjectives: [
      'Bertanya informasi keanggotaan',
      'Memahami jenis keanggotaan',
      'Bertanya tentang fasilitas',
      'Mengisi formulir pendaftaran',
    ],
    conversationExample:
      'A: 会員になりたいんですが。\r\nB: 月額8,000円です。\r\nA: プールはありますか？\r\nB: はい、あります。シャワーもあります。\r\nA: 営業時間は何時から何時までですか？\r\nB: 朝6時から夜11時までです。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a gym receptionist in Japan.\r\nYour role is to explain membership options and facilities.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Explain pricing clearly\r\n- Describe available facilities\r\n- Answer questions about hours',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvk00hc13atj6q6t8ro',
    title: 'Menjelaskan tentang Tempat Tinggal',
    description: 'Latihan menjelaskan tentang rumah atau apartemen tempat tinggal.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9p000jdkulchexa66a',
    difficulty: 'N4',
    scenario: 'Teman bertanya tentang apartemenmu. Jelaskan tentang kamar dan fitur-fiturnya.',
    learningObjectives: [
      'Menjelaskan jenis tempat tinggal',
      'Menjelaskan jumlah kamar',
      'Menggunakan kata sifat untuk mendeskripsikan rumah',
      'Menggunakan ～があります untuk fasilitas',
    ],
    conversationExample:
      'A: どんな家に住んでいますか？\r\nB: アパートに住んでいます。部屋が2つあります。\r\nA: 広いですか？\r\nB: ちょっと狭いですが、駅から近いです。\r\nA: いいですね。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      "You are a curious friend asking about someone's home.\r\nYour role is to ask about living situations.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Ask about room size and features\r\n- Show interest in their living situation\r\n- Comment positively",
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvg00h813atrbmghoj4',
    title: 'Berbicara tentang Makanan Favorit',
    description: 'Latihan berbicara tentang makanan kesukaan dan tidak disukai.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9s000rdkulat0ihgou',
    difficulty: 'N5',
    scenario: 'Kamu sedang makan siang dengan teman dan berbicara tentang preferensi makanan.',
    learningObjectives: [
      'Menyatakan makanan yang disukai',
      'Menyatakan makanan yang tidak disukai',
      'Menggunakan ～は好きじゃないです',
      'Memahami ungkapan ～はちょっと...',
    ],
    conversationExample:
      'A: 好きな食べ物は何ですか？\r\nB: ラーメンが好きです。Aさんは？\r\nA: 私は寿司が好きです。納豆は好きですか？\r\nB: 納豆はちょっと...。\r\nA: そうですか。私も苦手です。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friend talking about food preferences.\r\nYour role is to share and discuss favorite foods.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Share food likes and dislikes\r\n- Be understanding about different tastes\r\n- Keep the conversation fun',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvi00ha13atasqp6w4w',
    title: 'Berkonsultasi di Klinik',
    description:
      'Latihan berkomunikasi di klinik atau rumah sakit, termasuk menyampaikan gejala kepada dokter.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9s000pdkul7lpvlp5v',
    difficulty: 'N5',
    scenario:
      'Kamu berada di klinik dan perlu menjelaskan gejalamu kepada dokter serta menjawab pertanyaan dasar.',
    learningObjectives: [
      'Menjawab pertanyaan resepsionis',
      'Menyampaikan gejala kepada dokter',
      'Memahami instruksi dokter',
      'Menjawab pertanyaan tentang rasa sakit',
    ],
    conversationExample:
      'A: 初めてですか？\r\nB: はい、初めてです。\r\nA: 保険証はありますか？\r\nB: はい、あります。\r\nA: どうしましたか？\r\nB: おなかが痛いです。昨日から痛いです。',
    estimatedDuration: 15,
    maxMessages: 30,
    prompt:
      'You are a clinic receptionist and doctor.\r\nYour role is to help patients explain their symptoms.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Ask about insurance and first visit\r\n- Inquire about symptoms\r\n- Be professional and caring',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvh00h913at3qc5o46j',
    title: 'Berkunjung ke Rumah Teman',
    description:
      'Latihan sopan santun saat mengunjungi rumah teman, termasuk salam masuk dan keluar.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9q000ldkul91s0fxkx',
    difficulty: 'N5',
    scenario: 'Kamu mengunjungi rumah teman. Latihan salam yang tepat saat masuk dan keluar rumah.',
    learningObjectives: [
      'Menggunakan おじゃまします saat masuk',
      'Menerima tawaran minuman dengan sopan',
      'Memuji rumah atau barang',
      'Menggunakan おじゃましました saat pulang',
    ],
    conversationExample:
      'A: いらっしゃい。どうぞ、入ってください。\r\nB: おじゃまします。すてきな部屋ですね。\r\nA: ありがとう。お茶、どうぞ。\r\nB: いただきます。\r\nB: おじゃましました。ありがとうございました。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friend welcoming a guest to your home.\r\nYour role is to be a gracious host.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Welcome guests warmly\r\n- Offer drinks and refreshments\r\n- Accept compliments gracefully',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvn00he13atizcn0rg3',
    title: 'Melaporkan Masalah ke Pengelola Apartemen',
    description: 'Latihan melaporkan masalah di apartemen seperti kerusakan atau gangguan.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9p000jdkulchexa66a',
    difficulty: 'N5',
    scenario: 'Ada sesuatu yang rusak di apartemenmu. Laporkan masalahnya kepada pengelola gedung.',
    learningObjectives: [
      'Melaporkan kerusakan di apartemen',
      'Menjelaskan masalah dengan sederhana',
      'Menggunakan ～ません untuk menyatakan tidak berfungsi',
      'Meminta bantuan perbaikan',
    ],
    conversationExample:
      'A: すみません、ドアが閉まりません。\r\nB: いつからですか？\r\nA: 今朝からです。\r\nB: わかりました。今日の午後、見に行きます。\r\nA: お願いします。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are an apartment building manager.\r\nYour role is to receive and address maintenance requests.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask when the problem started\r\n- Promise to fix the issue\r\n- Be helpful and responsive',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvd00h613atqgy7ztgl',
    title: 'Membuat Janji Bertemu dengan Teman',
    description:
      'Latihan mengajak teman dan membuat janji bertemu, termasuk menentukan waktu dan tempat.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9q000ldkul91s0fxkx',
    difficulty: 'N5',
    scenario:
      'Kamu ingin mengajak teman pergi akhir pekan ini. Diskusikan kapan dan di mana bertemu.',
    learningObjectives: [
      'Mengajak teman dengan sopan',
      'Menentukan waktu bertemu',
      'Menentukan tempat bertemu',
      'Menggunakan ～ませんか untuk mengajak',
    ],
    conversationExample:
      'A: 週末、映画を見に行きませんか？\r\nB: いいですね。いつがいいですか？\r\nA: 土曜日の午後はどうですか？\r\nB: 大丈夫です。どこで会いましょうか？\r\nA: 駅の前で3時に会いましょう。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friend making weekend plans.\r\nYour role is to coordinate a meetup.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Suggest activities and times\r\n- Be flexible with scheduling\r\n- Confirm meeting details',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuva00h413at0j7ryswd',
    title: 'Memperkenalkan Keluarga',
    description: 'Latihan memperkenalkan anggota keluarga dan menceritakan tentang mereka.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9q000ldkul91s0fxkx',
    difficulty: 'N5',
    scenario:
      'Kamu sedang menunjukkan foto keluarga kepada teman. Perkenalkan anggota keluargamu dan ceritakan tentang mereka.',
    learningObjectives: [
      'Memperkenalkan anggota keluarga',
      'Menyebutkan pekerjaan keluarga',
      'Menyebutkan usia anggota keluarga',
      'Menggunakan istilah keluarga dengan benar',
    ],
    conversationExample:
      'A: これは私の家族の写真です。\r\nB: お父さんは何の仕事をしていますか？\r\nA: 父は先生です。母は会社員です。\r\nB: 弟さんは何歳ですか？\r\nA: 弟は15歳です。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a curious friend looking at family photos.\r\nYour role is to ask about family members.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask about jobs and ages\r\n- Show interest in family stories\r\n- Be friendly and engaged',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvf00h713atqbda2i0d',
    title: 'Naik Kereta Sehari-hari',
    description:
      'Latihan berkomunikasi saat menggunakan transportasi umum untuk kegiatan sehari-hari.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9w000zdkulrn15s0ej',
    difficulty: 'N5',
    scenario:
      'Kamu naik kereta untuk pergi ke tempat kerja atau sekolah. Latihan mengonfirmasi rute dan memahami pengumuman.',
    learningObjectives: [
      'Mengonfirmasi rute kereta',
      'Memahami pengumuman di stasiun',
      'Bertanya tentang keterlambatan',
      'Menyatakan ingin turun',
    ],
    conversationExample:
      'A: すみません、この電車は新宿に行きますか？\r\nB: いいえ、新宿には行きません。次の電車に乗ってください。\r\nA: 次の電車は何分後ですか？\r\nB: 5分後です。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a helpful commuter on a Japanese train.\r\nYour role is to assist other passengers with route information.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give clear route information\r\n- Mention timing when relevant\r\n- Be patient and helpful',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuv900h313at5mn2z204',
    title: 'Perkenalan Diri: Nama dan Asal',
    description: 'Latihan memperkenalkan diri termasuk nama, asal negara, dan tempat tinggal.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9q000ldkul91s0fxkx',
    difficulty: 'N5',
    scenario:
      'Kamu bertemu seseorang yang baru di acara komunitas. Perkenalkan dirimu dan tanyakan tentang mereka.',
    learningObjectives: [
      'Memperkenalkan nama sendiri',
      'Menyebutkan asal negara',
      'Menyebutkan tempat tinggal',
      'Bertanya informasi dasar tentang orang lain',
    ],
    conversationExample:
      'A: はじめまして。私はマリアです。インドネシアから来ました。\r\nB: はじめまして。私は田中です。どこに住んでいますか？\r\nA: 東京に住んでいます。よろしくお願いします。\r\nB: こちらこそ、よろしくお願いします。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a friendly Japanese person meeting someone new.\r\nYour role is to exchange introductions and get to know them.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Show interest in the other person\r\n- Ask simple follow-up questions\r\n- Be warm and welcoming',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvp00hg13at9lsm431k',
    title: 'Potong Rambut di Salon',
    description:
      'Latihan berkomunikasi di salon rambut untuk menyampaikan gaya potongan yang diinginkan.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9u000vdkulo1b04kw3',
    difficulty: 'N5',
    scenario:
      'Kamu berada di salon rambut dan ingin memotong rambut. Jelaskan gaya yang kamu inginkan.',
    learningObjectives: [
      'Menyampaikan keinginan di salon',
      'Menjelaskan panjang potongan',
      'Memahami pertanyaan penata rambut',
      'Menggunakan ～てください untuk permintaan',
    ],
    conversationExample:
      'A: 今日はどうしますか？\r\nB: カットをお願いします。\r\nA: どのくらい切りますか？\r\nB: 3センチくらいお願いします。\r\nA: 前髪はどうしますか？\r\nB: 少し短くしてください。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a friendly hair stylist at a Japanese salon.\r\nYour role is to understand customer preferences for haircuts.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask about desired length\r\n- Confirm style preferences\r\n- Be attentive and professional',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvo00hf13atvhogpvjt',
    title: 'Transaksi di Bank',
    description:
      'Latihan melakukan transaksi dasar di bank seperti membuka rekening dan transfer uang.',
    category: 'Keseharian',
    subcategoryId: 'cmipplg9o000hdkulqk6yf9x7',
    difficulty: 'N5',
    scenario:
      'Kamu berada di bank dan ingin membuka rekening atau melakukan transfer. Minta bantuan untuk mengisi formulir.',
    learningObjectives: [
      'Menyatakan keperluan di bank',
      'Bertanya cara mengisi formulir',
      'Memahami instruksi dasar dari petugas',
      'Menggunakan ～たいんですが',
    ],
    conversationExample:
      'A: すみません、口座を開きたいんですが。\r\nB: はい、こちらの用紙にご記入ください。\r\nA: ここは何を書きますか？\r\nB: お名前と住所をお願いします。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a bank teller in Japan.\r\nYour role is to help customers with basic banking services.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Guide customers through forms\r\n- Explain procedures simply\r\n- Be professional and patient',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvv00hl13atxmcp5le7',
    title: 'Perkenalan di Hari Pertama Kerja',
    description: 'Latihan memperkenalkan diri di depan rekan kerja baru pada hari pertama bekerja.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9x0012dkulm1ka8ao4',
    difficulty: 'N4',
    scenario:
      'Ini hari pertamamu bekerja di tempat baru. Perkenalkan dirimu kepada rekan kerja baru.',
    learningObjectives: [
      'Memperkenalkan diri secara formal',
      'Menyebutkan asal dan pengalaman singkat',
      'Menggunakan よろしくお願いします dengan tepat',
      'Menyampaikan harapan bekerja sama',
    ],
    conversationExample:
      'A: おはようございます。今日から働くアニです。インドネシアから来ました。\r\nB: ようこそ。私は田中です。\r\nA: よろしくお願いします。\r\nB: こちらこそ、よろしくお願いします。何かわからないことがあったら、聞いてください。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a welcoming colleague at a Japanese company.\r\nYour role is to greet and help new employees.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Welcome them warmly\r\n- Introduce yourself\r\n- Offer help and guidance',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvw00hm13atl62tx46r',
    title: 'Sapaan di Tempat Kerja',
    description: 'Latihan sapaan sehari-hari yang digunakan di tempat kerja Jepang.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga00018dkultirq8atr',
    difficulty: 'N4',
    scenario: 'Latihan sapaan sehari-hari yang digunakan di tempat kerja Jepang sepanjang hari.',
    learningObjectives: [
      'Menggunakan sapaan pagi di kantor',
      'Menggunakan おつかれさまです dengan tepat',
      'Menggunakan sapaan saat pulang kerja',
      'Memahami konteks penggunaan sapaan kerja',
    ],
    conversationExample:
      'A: おはようございます。\r\nB: おはようございます。\r\nA: おつかれさまです。\r\nB: おつかれさまです。\r\nA: お先に失礼します。\r\nB: おつかれさまでした。',
    estimatedDuration: 8,
    maxMessages: 30,
    prompt:
      'You are a colleague exchanging daily greetings.\r\nYour role is to practice workplace greetings.\r\n\r\nGuidelines:\r\n- Use appropriate workplace Japanese\r\n- Match greetings to time of day\r\n- Use おつかれさまです correctly\r\n- Be professional and friendly',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw000hp13at7jlsokcq',
    title: 'Bertanya Cara Menggunakan Peralatan Kantor',
    description: 'Latihan bertanya cara menggunakan mesin fotokopi atau peralatan kantor lainnya.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9x0012dkulm1ka8ao4',
    difficulty: 'N5',
    scenario: 'Kamu tidak tahu cara menggunakan mesin fotokopi. Minta bantuan rekan.',
    learningObjectives: [
      'Bertanya cara menggunakan peralatan',
      'Memahami penjelasan cara penggunaan',
      'Menggunakan ～方を教えてください',
      'Mengonfirmasi pemahaman',
    ],
    conversationExample:
      'A: すみません、このコピー機の使い方を教えてください。\r\nB: はい。まず、ここに紙を置いてください。\r\nA: はい。\r\nB: 次に、このボタンを押してください。\r\nA: わかりました。ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a helpful colleague explaining office equipment.\r\nYour role is to teach how to use machines.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give step-by-step instructions\r\n- Use まず、次に for sequencing\r\n- Be patient and clear',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuwd00hz13atgwovhg09',
    title: 'Bertukar Kartu Nama',
    description: 'Latihan bertukar kartu nama (meishi) dengan rekan bisnis sesuai etika Jepang.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9y0014dkulqty8g4bf',
    difficulty: 'N5',
    scenario: 'Kamu bertemu klien baru dan perlu bertukar kartu nama dengan cara yang sopan.',
    learningObjectives: [
      'Memberikan kartu nama dengan sopan',
      'Menerima kartu nama dengan hormat',
      'Menggunakan ungkapan pertukaran meishi',
      'Memahami etika kartu nama',
    ],
    conversationExample:
      'A: はじめまして。ABC会社の田中と申します。よろしくお願いいたします。\r\nB: はじめまして。XYZ会社のアニと申します。こちらこそ、よろしくお願いいたします。\r\nA: 頂戴いたします。\r\nB: ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a business professional exchanging business cards.\r\nYour role is to demonstrate proper meishi etiquette.\r\n\r\nGuidelines:\r\n- Use formal business Japanese\r\n- Present card with both hands\r\n- Accept card respectfully\r\n- Follow proper protocol',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw100hq13atdfzf66l2',
    title: 'Melaporkan Masalah di Tempat Kerja',
    description: 'Latihan melaporkan masalah atau kerusakan peralatan kepada atasan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga00018dkultirq8atr',
    difficulty: 'N5',
    scenario: 'Ada masalah dengan mesin di tempat kerja. Laporkan kepada atasanmu.',
    learningObjectives: [
      'Melaporkan masalah dengan sopan',
      'Menjelaskan masalah secara sederhana',
      'Meminta bantuan untuk mengatasi masalah',
      'Menggunakan ～が～ません untuk menyatakan tidak berfungsi',
    ],
    conversationExample:
      'A: すみません、プリンターが動きません。\r\nB: 本当ですか？ちょっと見せてください。\r\nA: はい。紙が詰まったみたいです。\r\nB: わかりました。直します。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a supervisor handling equipment problems.\r\nYour role is to receive reports and fix issues.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask to see the problem\r\n- Offer to fix it\r\n- Be helpful and responsive',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvx00hn13atlsj5c1ty',
    title: 'Memahami Instruksi Kerja Sederhana',
    description: 'Latihan memahami dan mengonfirmasi instruksi kerja dari atasan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga00018dkultirq8atr',
    difficulty: 'N5',
    scenario: 'Atasanmu memberikan tugas sederhana. Pahami instruksinya dan konfirmasi detailnya.',
    learningObjectives: [
      'Memahami instruksi sederhana dari atasan',
      'Mengonfirmasi detail instruksi',
      'Menggunakan ～ですね untuk konfirmasi',
      'Melaporkan penyelesaian tugas',
    ],
    conversationExample:
      'A: このコピーを20部お願いします。\r\nB: 20部ですね。わかりました。\r\nA: 3時までにお願いします。\r\nB: はい、3時までですね。\r\nB: コピー、終わりました。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a supervisor giving simple work instructions.\r\nYour role is to assign tasks clearly.\r\n\r\nGuidelines:\r\n- Use polite but direct Japanese\r\n- Give clear instructions\r\n- Specify deadlines\r\n- Confirm understanding',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuwe00i013atlax0h407',
    title: 'Memberikan Pendapat di Rapat',
    description: 'Latihan memberikan pendapat atau ide sederhana dalam rapat.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga1001adkulwms3dc2v',
    difficulty: 'N5',
    scenario:
      'Kamu diminta memberikan pendapat dalam rapat. Sampaikan ide atau opinimu dengan sopan.',
    learningObjectives: [
      'Menyampaikan pendapat dengan sopan',
      'Menggunakan ～と思います',
      'Menyetujui atau tidak setuju dengan sopan',
      'Mengajukan pertanyaan dalam rapat',
    ],
    conversationExample:
      'A: この企画について、どう思いますか？\r\nB: いい企画だと思います。\r\nA: 何か質問はありますか？\r\nB: はい、予算はいくらですか？\r\nA: 100万円です。\r\nB: わかりました。ありがとうございます。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are a meeting facilitator asking for opinions.\r\nYour role is to encourage participation in meetings.\r\n\r\nGuidelines:\r\n- Use polite business Japanese\r\n- Ask for opinions\r\n- Answer budget questions\r\n- Encourage discussion',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw400hs13atdo0cexvc',
    title: 'Memberitahu Keterlambatan ke Kantor',
    description: 'Latihan menelepon kantor untuk memberitahu keterlambatan atau ketidakhadiran.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9x0012dkulm1ka8ao4',
    difficulty: 'N5',
    scenario: 'Kamu akan terlambat atau tidak bisa masuk kerja. Telepon kantor untuk memberitahu.',
    learningObjectives: [
      'Menelepon kantor dengan sopan',
      'Menyampaikan alasan keterlambatan',
      'Meminta maaf atas keterlambatan',
      'Meminta tolong menyampaikan pesan',
    ],
    conversationExample:
      'A: もしもし、○○です。すみません、電車が遅れて、遅刻します。\r\nB: わかりました。何時ごろ着きますか？\r\nA: 10時ごろだと思います。申し訳ありません。\r\nB: わかりました。気をつけて来てください。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are an office staff receiving a call about lateness.\r\nYour role is to acknowledge the situation.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Ask about arrival time\r\n- Be understanding\r\n- Wish them a safe journey',
    voice: 'alloy',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuvz00ho13atbl6jron3',
    title: 'Meminjam Alat Kantor',
    description:
      'Latihan meminta izin untuk meminjam alat atau perlengkapan kantor dari rekan kerja.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga00018dkultirq8atr',
    difficulty: 'N5',
    scenario: 'Kamu perlu meminjam perlengkapan kantor dari rekan. Minta dengan sopan.',
    learningObjectives: [
      'Meminta izin meminjam dengan sopan',
      'Menggunakan いいですか untuk meminta izin',
      'Berterima kasih atas pinjaman',
      'Mengembalikan barang dengan sopan',
    ],
    conversationExample:
      'A: すみません、ホチキス、借りてもいいですか？\r\nB: はい、どうぞ。\r\nA: ありがとうございます。\r\nA: ホチキス、ありがとうございました。\r\nB: いいえ。',
    estimatedDuration: 8,
    maxMessages: 30,
    prompt:
      'You are a helpful colleague with office supplies.\r\nYour role is to lend items to coworkers.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Be willing to share supplies\r\n- Respond graciously\r\n- Accept thanks modestly',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw300hr13atu8jkmprq',
    title: 'Meminta Izin Tidak Masuk Kerja',
    description: 'Latihan meminta izin cuti atau tidak masuk kerja kepada atasan dengan sopan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9x0012dkulm1ka8ao4',
    difficulty: 'N5',
    scenario: 'Kamu perlu mengambil cuti. Minta izin kepada atasanmu dengan sopan.',
    learningObjectives: [
      'Meminta izin cuti dengan sopan',
      'Menyampaikan alasan cuti',
      'Menggunakan ～てもいいですか untuk meminta izin',
      'Berterima kasih atas izin yang diberikan',
    ],
    conversationExample:
      'A: 課長、すみません。来週の金曜日、お休みをいただいてもいいですか？\r\nB: どうしましたか？\r\nA: 病院に行きたいんです。\r\nB: わかりました。いいですよ。\r\nA: ありがとうございます。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a understanding supervisor handling leave requests.\r\nYour role is to approve reasonable time off.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Ask about the reason\r\n- Be understanding\r\n- Approve reasonable requests',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw500ht13atnokzzesc',
    title: 'Mengajak Rekan Makan Siang',
    description: 'Latihan mengajak rekan kerja untuk makan siang bersama.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga2001cdkul5q4piv4v',
    difficulty: 'N5',
    scenario: 'Sudah waktunya makan siang dan kamu ingin mengajak rekan untuk makan bersama.',
    learningObjectives: [
      'Mengajak rekan makan dengan sopan',
      'Menanyakan ketersediaan',
      'Merespons ajakan dengan tepat',
      'Menggunakan ～ませんか untuk mengajak',
    ],
    conversationExample:
      'A: お昼、一緒に食べませんか？\r\nB: いいですね。どこに行きますか？\r\nA: 駅前のラーメン屋はどうですか？\r\nB: いいですね。行きましょう。',
    estimatedDuration: 8,
    maxMessages: 30,
    prompt:
      'You are a friendly colleague open to lunch invitations.\r\nYour role is to accept and suggest lunch spots.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Be enthusiastic about lunch plans\r\n- Suggest or agree to restaurants\r\n- Keep the mood friendly',
    voice: 'echo',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw800hv13ata30ooqx3',
    title: 'Mengonfirmasi Jadwal Rapat',
    description: 'Latihan bertanya dan mengonfirmasi jadwal rapat atau acara kantor.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga1001adkulwms3dc2v',
    difficulty: 'N5',
    scenario: 'Kamu perlu mengonfirmasi waktu dan lokasi rapat yang akan datang.',
    learningObjectives: [
      'Bertanya jadwal rapat',
      'Mengonfirmasi waktu dan tempat',
      'Memahami informasi jadwal',
      'Mencatat detail rapat',
    ],
    conversationExample:
      'A: すみません、明日の会議は何時からですか？\r\nB: 10時からです。\r\nA: 場所はどこですか？\r\nB: 3階の会議室です。\r\nA: わかりました。ありがとうございます。',
    estimatedDuration: 8,
    maxMessages: 30,
    prompt:
      'You are a colleague who knows the meeting schedule.\r\nYour role is to provide meeting information.\r\n\r\nGuidelines:\r\n- Use polite Japanese\r\n- Give clear time and location\r\n- Confirm details if asked\r\n- Be helpful',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuwc00hy13at2cyzq0m7',
    title: 'Menyambut Tamu Bisnis',
    description: 'Latihan menyambut tamu atau klien bisnis di kantor dengan sopan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9y0014dkulqty8g4bf',
    difficulty: 'N5',
    scenario:
      'Kamu menyambut tamu bisnis yang datang ke kantor. Persilakan masuk dan tawarkan minuman.',
    learningObjectives: [
      'Menyambut tamu dengan sopan',
      'Mempersilakan duduk',
      'Menawarkan minuman',
      'Menggunakan bahasa bisnis formal',
    ],
    conversationExample:
      'A: いらっしゃいませ。田中様ですか？\r\nB: はい、田中です。\r\nA: お待ちしておりました。こちらへどうぞ。\r\nB: ありがとうございます。\r\nA: お飲み物はいかがですか？\r\nB: お茶をお願いします。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a business guest visiting a Japanese company.\r\nYour role is to interact politely with the reception.\r\n\r\nGuidelines:\r\n- Use formal polite Japanese\r\n- Respond to greetings properly\r\n- Accept offers graciously\r\n- Maintain business etiquette',
    voice: 'onyx',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw900hw13at70vepdao',
    title: 'Menyampaikan Pesan ke Rekan Kerja',
    description: 'Latihan menerima dan menyampaikan pesan untuk rekan kerja yang tidak ada.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga00018dkultirq8atr',
    difficulty: 'N5',
    scenario: 'Seseorang mencari rekanmu yang tidak ada di mejanya. Terima dan sampaikan pesannya.',
    learningObjectives: [
      'Menerima pesan dengan benar',
      'Menyampaikan pesan dengan tepat',
      'Mengonfirmasi detail pesan',
      'Menggunakan ～と言っていました',
    ],
    conversationExample:
      'A: 田中さんはいますか？\r\nB: 今、席を外しています。\r\nA: じゃ、伝言をお願いします。3時に電話してくださいと。\r\nB: 3時に電話ですね。わかりました。\r\nB: 田中さん、鈴木さんから電話がありました。3時に電話してくださいと言っていました。',
    estimatedDuration: 12,
    maxMessages: 30,
    prompt:
      'You are an office worker taking and delivering messages.\r\nYour role is to relay messages accurately.\r\n\r\nGuidelines:\r\n- Use polite Japanese (丁寧語)\r\n- Confirm message details\r\n- Deliver messages clearly\r\n- Use と言っていました for relaying',
    voice: 'shimmer',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuw700hu13atlf7yuf8k',
    title: 'Percakapan Santai dengan Rekan Kerja',
    description: 'Latihan berbincang santai dengan rekan kerja tentang akhir pekan atau liburan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga2001cdkul5q4piv4v',
    difficulty: 'N5',
    scenario: 'Berbincang santai dengan rekan tentang rencana akhir pekan atau liburan.',
    learningObjectives: [
      'Bertanya tentang rencana akhir pekan',
      'Berbagi cerita tentang liburan',
      'Menunjukkan ketertarikan pada cerita orang lain',
      'Menggunakan ekspresi sopan informal',
    ],
    conversationExample:
      'A: 週末、何か予定がありますか？\r\nB: 家族と温泉に行きます。\r\nA: いいですね。楽しんでください。\r\nB: ありがとうございます。Aさんは？\r\nA: 私は家でゆっくりします。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      "You are a friendly colleague making small talk.\r\nYour role is to chat about weekend plans.\r\n\r\nGuidelines:\r\n- Use casual polite Japanese\r\n- Share your plans\r\n- Show interest in others' plans\r\n- Keep conversation light",
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuwf00i113at8el639fu',
    title: 'Percakapan di Acara Perusahaan',
    description: 'Latihan berbincang dengan rekan dari departemen lain di acara perusahaan.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplga2001cdkul5q4piv4v',
    difficulty: 'N5',
    scenario:
      'Kamu menghadiri acara perusahaan dan bertemu rekan dari departemen lain. Berkenalan dan berbincang ringan.',
    learningObjectives: [
      'Berkenalan dengan rekan baru',
      'Bertanya tentang departemen dan pekerjaan',
      'Berbincang ringan di acara',
      'Membangun hubungan profesional',
    ],
    conversationExample:
      'A: はじめまして。営業部の田中です。\r\nB: はじめまして。総務部のアニです。よろしくお願いします。\r\nA: どのくらいこの会社にいますか？\r\nB: 1年です。田中さんは？\r\nA: 私は3年です。今日のパーティー、楽しいですね。',
    estimatedDuration: 10,
    maxMessages: 30,
    prompt:
      'You are a colleague from another department at a company event.\r\nYour role is to network and make small talk.\r\n\r\nGuidelines:\r\n- Use polite but friendly Japanese\r\n- Introduce your department\r\n- Ask about their work\r\n- Keep conversation enjoyable',
    voice: 'fable',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
  {
    id: 'cmipqkuwa00hx13atg4vguibj',
    title: 'Wawancara Kerja: Perkenalan Diri',
    description: 'Latihan memperkenalkan diri dan menjawab pertanyaan dasar dalam wawancara kerja.',
    category: 'Pekerjaan',
    subcategoryId: 'cmipplg9z0016dkuldilj9f2l',
    difficulty: 'N5',
    scenario:
      'Kamu sedang wawancara kerja. Perkenalkan dirimu dengan formal dan jawab pertanyaan pewawancara.',
    learningObjectives: [
      'Memperkenalkan diri secara formal',
      'Menjawab pertanyaan tentang latar belakang',
      'Menggunakan bahasa formal',
      'Menunjukkan motivasi',
    ],
    conversationExample:
      'A: 自己紹介をお願いします。\r\nB: はじめまして。アニと申します。インドネシアから来ました。大学で日本語を勉強しました。\r\nA: どうしてこの会社を選びましたか？\r\nB: 日本語を使う仕事がしたいからです。\r\nA: 日本語はどのくらい勉強しましたか？\r\nB: 3年間勉強しました。',
    estimatedDuration: 15,
    maxMessages: 30,
    prompt:
      'You are a professional interviewer at a Japanese company.\r\nYour role is to conduct a basic job interview.\r\n\r\nGuidelines:\r\n- Use formal polite Japanese (丁寧語)\r\n- Ask about self-introduction\r\n- Ask about motivation\r\n- Be professional and encouraging',
    voice: 'nova',
    speakingSpeed: 1,
    audioExample: null,
    deckIds: [],
  },
];

export async function seedTasks() {
  console.log('Seeding tasks...');

  for (const taskData of tasksData) {
    const { deckIds, ...task } = taskData;

    const created = await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        category: task.category,
        subcategoryId: task.subcategoryId,
        difficulty: task.difficulty,
        scenario: task.scenario,
        learningObjectives: task.learningObjectives,
        conversationExample: task.conversationExample,
        estimatedDuration: task.estimatedDuration,
        maxMessages: task.maxMessages,
        prompt: task.prompt,
        voice: task.voice,
        speakingSpeed: task.speakingSpeed,
        audioExample: task.audioExample,
        isActive: true,
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        subcategoryId: task.subcategoryId,
        difficulty: task.difficulty,
        scenario: task.scenario,
        learningObjectives: task.learningObjectives,
        conversationExample: task.conversationExample,
        estimatedDuration: task.estimatedDuration,
        maxMessages: task.maxMessages,
        prompt: task.prompt,
        voice: task.voice,
        speakingSpeed: task.speakingSpeed,
        audioExample: task.audioExample,
        isActive: true,
      },
    });

    // Link decks if any
    if (deckIds && deckIds.length > 0) {
      for (const deckId of deckIds) {
        await prisma.taskDeck.upsert({
          where: {
            taskId_deckId: {
              taskId: created.id,
              deckId: deckId,
            },
          },
          update: {},
          create: {
            taskId: created.id,
            deckId: deckId,
          },
        });
      }
    }

    console.log(`✓ Task: ${created.title}`);
  }

  console.log(`✅ ${tasksData.length} tasks seeded successfully!`);
}

// Run if executed directly
if (require.main === module) {
  seedTasks()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

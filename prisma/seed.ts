import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database...');

  // Buat kategori tugas
  console.log('📁 Membuat kategori tugas...');
  const categories = [
    { name: 'Restaurant' },
    { name: 'Shopping' },
    { name: 'Travel' },
    { name: 'Business' },
    { name: 'Healthcare' },
    { name: 'Daily Life' },
    { name: 'Education' },
  ];

  for (const category of categories) {
    await prisma.taskCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Berhasil membuat ${categories.length} kategori tugas`);

  // Buat tugas contoh
  console.log('📝 Membuat tugas contoh...');
  const tasks = [
    {
      title: 'Memesan Ramen di Restoran',
      description: 'Berlatih memesan makanan di restoran ramen Jepang',
      category: 'Restaurant',
      difficulty: 'N5',
      scenario:
        'Anda berada di sebuah restoran ramen populer di Tokyo. Pelayan mendekati meja Anda untuk mengambil pesanan. Anda ingin memesan semangkuk ramen, menentukan preferensi Anda, dan menyelesaikan transaksi dengan sopan.',
      learningObjectives: [
        'Mempelajari kosakata makanan dasar dalam bahasa Jepang',
        'Berlatih frasa memesan dengan sopan',
        'Memahami etiket restoran',
        'Menangani interaksi pembayaran',
      ],
      conversationExample:
        'T: いらっしゃいませ。ご注文はお決まりですか？\nG: はい、醤油ラーメンをください。\nT: かしこまりました。トッピングは何にしますか？\nG: チャーシューと煮卵をお願いします。\nT: 辛さはいかがいたしましょうか？\nG: 普通の辛さでお願いします。\nT: かしこまりました。少々お待ちください。',
      estimatedDuration: 15,
      isActive: true,
    },
    {
      title: 'Membeli Pakaian di Department Store',
      description: 'Berbelanja pakaian di department store Jepang',
      category: 'Shopping',
      difficulty: 'N4',
      scenario:
        'Anda perlu membeli kemeja di department store di Jepang. Anda ingin menemukan ukuran yang tepat, bertanya tentang warna yang tersedia, dan melakukan pembelian.',
      learningObjectives: [
        'Kosakata pakaian',
        'Ekspresi ukuran dan warna',
        'Dasar-dasar negosiasi harga',
        'Etiket berbelanja',
      ],
      conversationExample:
        'T: いらっしゃいませ。何かお探しですか？\nG: はい、シャツを探しています。\nT: こちらのシャツはいかがですか？いろいろな色がございます。\nG: いいですね。青色はありますか？\nT: はい、ございます。サイズはいかがいたしましょうか？\nG: Mサイズをお願いします。\nT: かしこまりました。試着されますか？\nG: はい、お願いします。',
      estimatedDuration: 20,
      isActive: true,
    },
    {
      title: 'Menanyakan Arah ke Stasiun',
      description: 'Mendapatkan petunjuk arah ke stasiun kereta terdekat',
      category: 'Travel',
      difficulty: 'N5',
      scenario:
        'Anda tersesat di lingkungan Jepang dan perlu menemukan stasiun kereta terdekat. Anda mendekati penduduk lokal yang ramah untuk menanyakan arah.',
      learningObjectives: [
        'Kosakata arah',
        'Meminta bantuan dengan sopan',
        'Memahami deskripsi lokasi',
        'Mengungkapkan rasa terima kasih',
      ],
      conversationExample:
        'G: すみません、駅はどこですか？\nT: ああ、駅ですね。まっすぐ行って、二つ目の角を右に曲がってください。\nG: まっすぐ行って、二つ目の角を右ですね？\nT: はい、そうです。5分ぐらい歩きます。\nG: わかりました。ありがとうございます。\nT: どういたしまして。気をつけて。',
      estimatedDuration: 10,
      isActive: true,
    },
    {
      title: 'Membuat Janji dengan Dokter',
      description: 'Menelepon klinik untuk menjadwalkan janji temu medis',
      category: 'Healthcare',
      difficulty: 'N3',
      scenario:
        'Anda merasa kurang sehat dan perlu membuat janji temu di klinik lokal. Anda menelepon resepsionis untuk menjadwalkan kunjungan.',
      learningObjectives: [
        'Kosakata medis',
        'Etiket percakapan telepon',
        'Menjelaskan gejala',
        'Memahami penjadwalan janji temu',
      ],
      conversationExample:
        'T: はい、〇〇クリニックです。\nG: あの、予約をお願いしたいんですが。\nT: かしこまりました。どのようなご用件でしょうか？\nG: 頭痛と熱があります。\nT: 分かりました。いつがよろしいですか？\nG: 明日の午後は空いていますか？\nT: 明日の午後2時はいかがでしょうか？\nG: はい、大丈夫です。\nT: では、明日の午後2時でご予約をお取りいたします。保険証をお持ちください。',
      estimatedDuration: 15,
      isActive: true,
    },
    {
      title: 'Perkenalan dalam Wawancara Kerja',
      description: 'Memperkenalkan diri dalam setting wawancara kerja',
      category: 'Business',
      difficulty: 'N2',
      scenario:
        'Anda sedang wawancara untuk posisi di perusahaan Jepang. Pewawancara meminta Anda untuk memperkenalkan diri dan menjelaskan latar belakang Anda.',
      learningObjectives: [
        'Kosakata bahasa Jepang bisnis',
        'Perkenalan diri formal',
        'Membahas pengalaman kerja',
        'Ekspresi kesopanan profesional',
      ],
      conversationExample:
        'T: それでは、自己紹介をお願いします。\nG: はい、〇〇と申します。大学で経営学を専攻しておりまして、卒業後は海外のIT企業で3年間働いておりました。\nT: なるほど。どのような業務を担当されていましたか？\nG: プロジェクトマネジメントを担当しておりまして、チームメンバーと協力して様々なプロジェクトを成功に導いてまいりました。\nT: チームマネジメントの経験もあるということですね。\nG: はい、そうでございます。御社でもその経験を活かして貢献できればと考えております。',
      estimatedDuration: 25,
      isActive: true,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }
  console.log(`✅ Berhasil membuat ${tasks.length} tugas contoh`);

  // Buat user admin
  console.log('👤 Membuat user admin...');
  await prisma.user.upsert({
    where: { email: 'admin@gengobot.com' },
    update: {},
    create: {
      email: 'admin@gengobot.com',
      name: 'Admin User',
      isAdmin: true,
      proficiency: 'N1',
    },
  });
  console.log('✅ Berhasil membuat user admin: admin@gengobot.com');

  // Buat user contoh
  console.log('👤 Membuat user contoh...');
  await prisma.user.upsert({
    where: { email: 'student@gengobot.com' },
    update: {},
    create: {
      email: 'student@gengobot.com',
      name: 'Siswa Contoh',
      isAdmin: false,
      proficiency: 'N5',
      preferredTaskCategories: ['Restaurant', 'Shopping', 'Travel'],
    },
  });
  console.log('✅ Berhasil membuat user contoh: student@gengobot.com');

  console.log('🎉 Seeding database selesai dengan sukses!');
}

main()
  .catch(e => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

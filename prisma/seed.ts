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
      successCriteria: [
        'Berhasil memesan makanan',
        'Menyebutkan minimal satu preferensi (tingkat pedas, topping, dll.)',
        'Menyelesaikan transaksi pembayaran',
        'Menggunakan tingkat kesopanan yang sesuai',
      ],
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
      successCriteria: [
        'Menemukan dan mengidentifikasi item pakaian yang diinginkan',
        'Bertanya tentang ukuran dan warna',
        'Menanyakan harga',
        'Menyelesaikan pembelian',
      ],
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
      successCriteria: [
        'Menanyakan arah dengan sopan',
        'Memahami respons arah dasar',
        'Mengonfirmasi rute',
        'Berterima kasih dengan tepat',
      ],
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
      successCriteria: [
        'Menjelaskan alasan kunjungan',
        'Memberikan ketersediaan waktu',
        'Mengonfirmasi tanggal dan waktu janji temu',
        'Memahami instruksi klinik',
      ],
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
      successCriteria: [
        'Memberikan perkenalan diri yang komprehensif',
        'Menjelaskan pengalaman kerja yang relevan',
        'Menggunakan keigo (bahasa hormat) yang tepat',
        'Menjawab pertanyaan lanjutan secara profesional',
      ],
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

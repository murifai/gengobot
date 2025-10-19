-- GengoBot Database Seed
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo/sql/new

-- Insert Task Categories
INSERT INTO "TaskCategory" (id, name, description, icon, "sortOrder", "createdAt") VALUES
('clcat001', 'Restaurant', 'Skenario memesan makanan dan makan di restoran', '🍜', 1, NOW()),
('clcat002', 'Shopping', 'Skenario berbelanja dan retail', '🛍️', 2, NOW()),
('clcat003', 'Travel', 'Skenario transportasi dan perjalanan', '✈️', 3, NOW()),
('clcat004', 'Business', 'Skenario profesional dan tempat kerja', '💼', 4, NOW()),
('clcat005', 'Healthcare', 'Skenario medis dan kesehatan', '🏥', 5, NOW()),
('clcat006', 'Daily Life', 'Rutinitas sehari-hari dan interaksi sosial', '🏠', 6, NOW()),
('clcat007', 'Education', 'Skenario akademik dan sekolah', '📚', 7, NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Users (Database records - Auth users must be created separately in Supabase Auth)
INSERT INTO "User" (id, email, name, proficiency, "isAdmin", "preferredTaskCategories", "createdAt", "updatedAt") VALUES
('admin-user-001', 'admin@gengobot.com', 'Admin User', 'N1', true, '[]'::jsonb, NOW(), NOW()),
('student-user-001', 'student@gengobot.com', 'Siswa Contoh', 'N5', false, '["Restaurant", "Shopping", "Travel"]'::jsonb, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Sample Tasks
INSERT INTO "Task" (id, title, description, category, difficulty, scenario, "learningObjectives", "successCriteria", "estimatedDuration", "isActive", "createdAt", "updatedAt") VALUES
(
  'task-001',
  'Memesan Ramen di Restoran',
  'Berlatih memesan makanan di restoran ramen Jepang',
  'Restaurant',
  'N5',
  'Anda berada di sebuah restoran ramen populer di Tokyo. Pelayan mendekati meja Anda untuk mengambil pesanan. Anda ingin memesan semangkuk ramen, menentukan preferensi Anda, dan menyelesaikan transaksi dengan sopan.',
  '["Mempelajari kosakata makanan dasar dalam bahasa Jepang", "Berlatih frasa memesan dengan sopan", "Memahami etiket restoran", "Menangani interaksi pembayaran"]'::jsonb,
  '["Berhasil memesan makanan", "Menyebutkan minimal satu preferensi (tingkat pedas, topping, dll.)", "Menyelesaikan transaksi pembayaran", "Menggunakan tingkat kesopanan yang sesuai"]'::jsonb,
  15,
  true,
  NOW(),
  NOW()
),
(
  'task-002',
  'Membeli Pakaian di Department Store',
  'Berbelanja pakaian di department store Jepang',
  'Shopping',
  'N4',
  'Anda perlu membeli kemeja di department store di Jepang. Anda ingin menemukan ukuran yang tepat, bertanya tentang warna yang tersedia, dan melakukan pembelian.',
  '["Kosakata pakaian", "Ekspresi ukuran dan warna", "Dasar-dasar negosiasi harga", "Etiket berbelanja"]'::jsonb,
  '["Menemukan dan mengidentifikasi item pakaian yang diinginkan", "Bertanya tentang ukuran dan warna", "Menanyakan harga", "Menyelesaikan pembelian"]'::jsonb,
  20,
  true,
  NOW(),
  NOW()
),
(
  'task-003',
  'Menanyakan Arah ke Stasiun',
  'Mendapatkan petunjuk arah ke stasiun kereta terdekat',
  'Travel',
  'N5',
  'Anda tersesat di lingkungan Jepang dan perlu menemukan stasiun kereta terdekat. Anda mendekati penduduk lokal yang ramah untuk menanyakan arah.',
  '["Kosakata arah", "Meminta bantuan dengan sopan", "Memahami deskripsi lokasi", "Mengungkapkan rasa terima kasih"]'::jsonb,
  '["Menanyakan arah dengan sopan", "Memahami respons arah dasar", "Mengonfirmasi rute", "Berterima kasih dengan tepat"]'::jsonb,
  10,
  true,
  NOW(),
  NOW()
),
(
  'task-004',
  'Membuat Janji dengan Dokter',
  'Menelepon klinik untuk menjadwalkan janji temu medis',
  'Healthcare',
  'N3',
  'Anda merasa kurang sehat dan perlu membuat janji temu di klinik lokal. Anda menelepon resepsionis untuk menjadwalkan kunjungan.',
  '["Kosakata medis", "Etiket percakapan telepon", "Menjelaskan gejala", "Memahami penjadwalan janji temu"]'::jsonb,
  '["Menjelaskan alasan kunjungan", "Memberikan ketersediaan waktu", "Mengonfirmasi tanggal dan waktu janji temu", "Memahami instruksi klinik"]'::jsonb,
  15,
  true,
  NOW(),
  NOW()
),
(
  'task-005',
  'Perkenalan dalam Wawancara Kerja',
  'Memperkenalkan diri dalam setting wawancara kerja',
  'Business',
  'N2',
  'Anda sedang wawancara untuk posisi di perusahaan Jepang. Pewawancara meminta Anda untuk memperkenalkan diri dan menjelaskan latar belakang Anda.',
  '["Kosakata bahasa Jepang bisnis", "Perkenalan diri formal", "Membahas pengalaman kerja", "Ekspresi kesopanan profesional"]'::jsonb,
  '["Memberikan perkenalan diri yang komprehensif", "Menjelaskan pengalaman kerja yang relevan", "Menggunakan keigo (bahasa hormat) yang tepat", "Menjawab pertanyaan lanjutan secara profesional"]'::jsonb,
  25,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 'Task Categories:' as info, COUNT(*) as count FROM "TaskCategory"
UNION ALL
SELECT 'Users:', COUNT(*) FROM "User"
UNION ALL
SELECT 'Tasks:', COUNT(*) FROM "Task";

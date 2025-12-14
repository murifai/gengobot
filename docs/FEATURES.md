# GengoBot - Dokumentasi Fitur Lengkap

Dokumentasi fitur aplikasi GengoBot untuk pembelajaran bahasa Jepang.

---

## Daftar Isi

1. [Dashboard](#1-dashboard)
2. [Kaiwa (Percakapan)](#2-kaiwa-percakapan)
3. [Drill (Flashcard)](#3-drill-flashcard)
4. [Profile & Progress](#4-profile--progress)
5. [Subscription & Billing](#5-subscription--billing)
6. [Fitur Pendukung](#6-fitur-pendukung)

---

## 1. Dashboard

Halaman utama setelah login yang menampilkan ringkasan aktivitas dan progress belajar.

### 1.1 Ringkasan Kredit

- Tampilan saldo kredit (remaining/total)
- Progress bar penggunaan kredit
- Status subscription (Free/Basic/Pro)
- Info trial (jika aktif): sisa hari trial, limit harian

### 1.2 Statistik Mingguan

- **Roleplay Minutes**: Total waktu latihan roleplay dalam seminggu
- **Kaiwa Bebas Minutes**: Total waktu percakapan bebas dalam seminggu
- **Drill Cards**: Jumlah kartu yang dipelajari dalam seminggu
- Breakdown aktivitas per hari

### 1.3 Aktivitas Terakhir

- Riwayat aktivitas terbaru (deck yang dipelajari, percakapan yang dilakukan)
- Timestamp aktivitas
- Quick access ke aktivitas sebelumnya

### 1.4 Rekomendasi Belajar

- Saran deck untuk dipelajari
- Rekomendasi task roleplay berdasarkan level
- Deck yang belum selesai

---

## 2. Kaiwa (Percakapan)

Fitur utama untuk latihan percakapan bahasa Jepang dengan AI.

### 2.1 Ngobrol Bebas (Free Conversation)

Percakapan bebas dengan karakter AI tanpa skenario tertentu.

#### Sub-fitur:

| Fitur                | Deskripsi                                                                      |
| -------------------- | ------------------------------------------------------------------------------ |
| **Pilih Karakter**   | Pilih karakter AI untuk diajak ngobrol (berbagai personality dan relationship) |
| **Chat Text**        | Kirim pesan teks dalam bahasa Jepang                                           |
| **Voice Recording**  | Rekam suara dan otomatis di-transcribe ke teks                                 |
| **Voice Playback**   | Dengarkan balasan AI dalam bentuk audio                                        |
| **Vocabulary Popup** | Klik kata Jepang untuk melihat arti dan detail                                 |
| **Hint System**      | Minta bantuan/hint saat bingung merespons                                      |
| **Session History**  | Riwayat percakapan tersimpan                                                   |

#### Cara Penggunaan:

1. Buka menu **Kaiwa** → pilih **Ngobrol Bebas**
2. Pilih karakter yang ingin diajak ngobrol
3. Mulai percakapan dengan mengetik atau merekam suara
4. Klik kata Jepang yang tidak dimengerti untuk melihat artinya

---

### 2.2 Roleplay (Task-Based Learning)

Latihan percakapan dengan skenario dan tujuan tertentu.

#### Sub-fitur:

| Fitur                   | Deskripsi                                                          |
| ----------------------- | ------------------------------------------------------------------ |
| **Task Browser**        | Jelajahi berbagai skenario roleplay berdasarkan kategori dan level |
| **Pre-Task Study**      | Pelajari vocabulary dan grammar terkait sebelum mulai              |
| **Learning Objectives** | Daftar tujuan yang harus dicapai dalam percakapan                  |
| **Deck Integration**    | Deck terkait yang perlu dipelajari sebelum task                    |
| **Audio Examples**      | Contoh percakapan dalam audio dengan waveform visualization        |
| **Progress Tracking**   | Tracking real-time pencapaian objectives                           |
| **Hint System**         | Bantuan saat kesulitan mencapai objective                          |
| **Post-Task Review**    | Feedback dan assessment setelah selesai                            |
| **Recommendations**     | Rekomendasi task selanjutnya                                       |

#### Alur Roleplay:

```
1. Pilih Skenario
   ↓
2. Pre-Task Study
   ├── Lihat scenario & objectives
   ├── Pelajari deck terkait (opsional)
   └── Dengarkan contoh audio
   ↓
3. Mulai Roleplay
   ├── Chat dengan AI sesuai skenario
   ├── Capai learning objectives
   └── Gunakan hint jika perlu
   ↓
4. Post-Task Review
   ├── Lihat objectives yang tercapai
   ├── Baca feedback & assessment
   └── Lihat rekomendasi task selanjutnya
```

#### Kategori Roleplay:

- **Kehidupan Sehari-hari** (自己紹介, 買い物, レストラン)
- **Bisnis** (会議, メール, 電話)
- **Travel** (ホテル, 道案内, 空港)
- **Casual** (友達との会話, SNS)

---

### 2.3 Karakter AI

Kelola karakter AI untuk percakapan.

#### Sub-fitur:

| Fitur                  | Deskripsi                                                       |
| ---------------------- | --------------------------------------------------------------- |
| **Karakter Default**   | Karakter bawaan dengan berbagai personality                     |
| **Buat Karakter**      | Buat karakter custom dengan nama, personality, dan relationship |
| **Edit Karakter**      | Edit karakter custom yang sudah dibuat                          |
| **Relationship Types** | Teman, Guru, Atasan, Pacar, Keluarga                            |

#### Cara Membuat Karakter:

1. Buka **Profile** → **Characters** → **Buat Baru**
2. Isi nama karakter (dalam bahasa Jepang)
3. Pilih tipe relationship
4. Tulis deskripsi personality
5. Simpan

---

## 3. Drill (Flashcard)

Sistem pembelajaran dengan flashcard menggunakan Spaced Repetition System (SRS).

### 3.1 Deck Browser

Jelajahi dan kelola deck flashcard.

#### Sub-fitur:

| Fitur                  | Deskripsi                                             |
| ---------------------- | ----------------------------------------------------- |
| **Public Decks**       | Deck publik yang bisa dipelajari siapa saja           |
| **My Decks**           | Deck pribadi yang dibuat sendiri                      |
| **Favorite Decks**     | Deck yang ditandai sebagai favorit                    |
| **Studying Decks**     | Deck yang sedang aktif dipelajari                     |
| **Search & Filter**    | Cari deck berdasarkan nama, kategori, atau difficulty |
| **Deck Stats Preview** | Preview statistik deck (jumlah kartu, mastery rate)   |

---

### 3.2 Study Session

Sesi belajar flashcard dengan SRS.

#### Sub-fitur:

| Fitur                   | Deskripsi                                      |
| ----------------------- | ---------------------------------------------- |
| **Flashcard Display**   | Tampilan kartu dengan animasi flip             |
| **Multiple Card Types** | Hiragana, Katakana, Kanji, Vocabulary, Grammar |
| **Audio Playback**      | Dengarkan pengucapan                           |
| **Stroke Order**        | Urutan penulisan untuk Kanji (SVG animation)   |
| **Example Sentences**   | Contoh kalimat penggunaan                      |
| **Rating System**       | Tandai "Hafal" atau "Belum Hafal"              |
| **Session Progress**    | Progress bar sesi belajar                      |
| **Completion Stats**    | Statistik di akhir sesi                        |

#### Tipe Kartu:

| Tipe           | Field yang Ditampilkan                             |
| -------------- | -------------------------------------------------- |
| **Hiragana**   | Character, Romaji, Stroke SVG                      |
| **Katakana**   | Character, Romaji, Stroke SVG                      |
| **Kanji**      | Kanji, Meaning, Onyomi, Kunyomi, Stroke SVG        |
| **Vocabulary** | Word, Reading, Meaning, Part of Speech, JLPT Level |
| **Grammar**    | Grammar Point, Meaning, Usage Note, Examples       |

---

### 3.3 Deck Management

Kelola deck dan flashcard.

#### Sub-fitur:

| Fitur                | Deskripsi                                 |
| -------------------- | ----------------------------------------- |
| **Buat Deck**        | Buat deck baru dari awal                  |
| **Import Deck**      | Import deck dari file Excel               |
| **Export Deck**      | Export deck ke file                       |
| **Duplicate Deck**   | Duplikasi deck yang ada                   |
| **Share Deck**       | Bagikan deck dengan link publik           |
| **Edit Deck**        | Edit nama, deskripsi, dan pengaturan deck |
| **Add Flashcard**    | Tambah kartu baru ke deck                 |
| **Edit Flashcard**   | Edit kartu yang sudah ada                 |
| **Delete Flashcard** | Hapus kartu dari deck                     |
| **Filter by Type**   | Filter kartu berdasarkan tipe             |

#### Cara Import Deck:

1. Buka **Drill** → **Buat Deck Baru**
2. Pilih **Import dari Excel**
3. Download template Excel
4. Isi template dengan data kartu
5. Upload file Excel
6. Review dan simpan

---

### 3.4 Deck Statistics

Statistik pembelajaran per deck.

#### Metrics:

| Metric             | Deskripsi                             |
| ------------------ | ------------------------------------- |
| **Total Sessions** | Jumlah sesi belajar                   |
| **Cards Reviewed** | Total kartu yang sudah di-review      |
| **Study Time**     | Total waktu belajar                   |
| **Study Streak**   | Berapa hari berturut-turut belajar    |
| **Mastery Rate**   | Persentase kartu yang sudah hafal     |
| **Hafal vs Belum** | Breakdown kartu hafal dan belum hafal |

---

## 4. Profile & Progress

### 4.1 Profile

Informasi dan pengaturan akun.

#### Sub-fitur:

| Fitur                 | Deskripsi                                |
| --------------------- | ---------------------------------------- |
| **Profile Info**      | Nama, email, foto profil                 |
| **Edit Profile**      | Edit nama, nickname, domisili, institusi |
| **Upload Avatar**     | Upload foto profil dengan crop           |
| **Proficiency Level** | Level kemampuan bahasa Jepang (N5-N1)    |
| **Account Settings**  | Pengaturan akun                          |

---

### 4.2 Learning Progress

Tracking progress pembelajaran keseluruhan.

#### Sub-fitur:

| Fitur                    | Deskripsi                                    |
| ------------------------ | -------------------------------------------- |
| **Overall Stats**        | Statistik keseluruhan pembelajaran           |
| **Weekly Progress**      | Progress mingguan dengan chart               |
| **Activity Breakdown**   | Breakdown aktivitas (Roleplay, Kaiwa, Drill) |
| **Achievement Tracking** | Pencapaian dan milestone                     |
| **Study Streak**         | Streak belajar harian                        |

---

## 5. Subscription & Billing

### 5.1 Subscription Plans

Pilihan paket berlangganan.

#### Paket Tersedia:

| Paket     | Fitur                              |
| --------- | ---------------------------------- |
| **Free**  | Akses terbatas, trial credits      |
| **Basic** | Kredit bulanan, semua fitur dasar  |
| **Pro**   | Kredit lebih banyak, fitur premium |

---

### 5.2 Credit System

Sistem kredit untuk penggunaan AI.

#### Sub-fitur:

| Fitur                  | Deskripsi                                       |
| ---------------------- | ----------------------------------------------- |
| **Credit Balance**     | Tampilan saldo kredit                           |
| **Usage History**      | Riwayat penggunaan kredit                       |
| **Usage Types**        | MIC (voice), TEXT, AUDIO (TTS)                  |
| **Token Details**      | Detail token usage (model, input/output tokens) |
| **Low Credit Warning** | Peringatan saat kredit hampir habis             |

---

### 5.3 Trial System

Sistem trial untuk pengguna baru.

#### Sub-fitur:

| Fitur               | Deskripsi                                        |
| ------------------- | ------------------------------------------------ |
| **Trial Period**    | Periode trial (berapa hari)                      |
| **Daily Limit**     | Limit penggunaan harian saat trial               |
| **Trial Credits**   | Kredit khusus trial (terpisah dari subscription) |
| **Trial Countdown** | Countdown sisa hari trial                        |
| **Trial Extension** | Extend trial (jika eligible)                     |

---

### 5.4 Payment

Sistem pembayaran.

#### Sub-fitur:

| Fitur                | Deskripsi                       |
| -------------------- | ------------------------------- |
| **Plan Selection**   | Pilih paket berlangganan        |
| **Duration Options** | Pilih durasi (1/3/6/12 bulan)   |
| **Checkout**         | Proses checkout dengan Midtrans |
| **Payment Methods**  | Berbagai metode pembayaran      |
| **Payment History**  | Riwayat pembayaran              |
| **Invoice**          | Invoice/bukti pembayaran        |

---

### 5.5 Voucher System

Sistem voucher dan kode promo.

#### Sub-fitur:

| Fitur               | Deskripsi                             |
| ------------------- | ------------------------------------- |
| **Redeem Voucher**  | Tukarkan kode voucher                 |
| **Validate Code**   | Validasi kode sebelum apply           |
| **Voucher History** | Riwayat voucher yang sudah ditukarkan |
| **Active Vouchers** | Voucher yang sedang aktif             |

---

## 6. Fitur Pendukung

### 6.1 Voice Features

Fitur suara untuk pembelajaran.

| Fitur               | Deskripsi                            |
| ------------------- | ------------------------------------ |
| **Speech-to-Text**  | Konversi suara ke teks (Whisper API) |
| **Text-to-Speech**  | Konversi teks ke suara AI            |
| **Audio Playback**  | Playback audio dengan visualisasi    |
| **Voice Recording** | Rekam suara dengan visualizer        |

---

### 6.2 Vocabulary Tools

Alat bantu vocabulary.

| Fitur                     | Deskripsi                         |
| ------------------------- | --------------------------------- |
| **Vocabulary Lookup**     | Cari arti kata                    |
| **Vocabulary Popup**      | Popup detail kata saat diklik     |
| **Add to Deck**           | Tambahkan kata ke deck dari popup |
| **JLPT Level Badge**      | Tampilan level JLPT kata          |
| **Verb Conjugation Info** | Info konjugasi untuk kata kerja   |
| **Part of Speech**        | Kelas kata dalam istilah Jepang   |

---

### 6.3 Onboarding

Proses onboarding untuk pengguna baru.

| Fitur                  | Deskripsi                  |
| ---------------------- | -------------------------- |
| **Proficiency Setup**  | Set level kemampuan awal   |
| **Goal Setting**       | Set tujuan belajar         |
| **Feature Tour**       | Tour fitur-fitur aplikasi  |
| **Initial Assessment** | Assessment awal (opsional) |

---

### 6.4 Notifications

Sistem notifikasi.

| Fitur                    | Deskripsi                                              |
| ------------------------ | ------------------------------------------------------ |
| **In-App Notifications** | Notifikasi dalam aplikasi                              |
| **Mark as Read**         | Tandai notifikasi sudah dibaca                         |
| **Notification Types**   | Berbagai tipe notifikasi (subscription, reminder, dll) |

---

## Shortcut & Tips

### Keyboard Shortcuts

| Shortcut          | Action                      |
| ----------------- | --------------------------- |
| `Space` (hold)    | Mulai rekam suara (di chat) |
| `Space` (release) | Stop rekam dan kirim        |
| `Enter`           | Kirim pesan                 |

### Tips Penggunaan

1. **Gunakan voice recording** untuk latihan pengucapan
2. **Klik kata Jepang** di chat untuk melihat arti
3. **Pelajari deck terkait** sebelum mulai roleplay
4. **Gunakan hint** jika kesulitan mencapai objective
5. **Review deck secara rutin** untuk SRS yang efektif
6. **Set daily goals** untuk konsistensi belajar

---

## Technical Notes

### Supported Browsers

- Chrome (recommended)
- Firefox
- Safari
- Edge

### Mobile Support

- Responsive design untuk semua ukuran layar
- Voice recording support di mobile browsers
- Touch-friendly interface

---

**Last Updated:** 2024-12

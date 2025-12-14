# GengoBot - Sistem Percakapan

Dokumentasi lengkap tentang fitur percakapan di GengoBot, termasuk dasar teori, cara kerja, dan sistem penilaian.

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Dasar Teori](#2-dasar-teori)
3. [Mode Percakapan](#3-mode-percakapan)
4. [Alur Penggunaan](#4-alur-penggunaan)
5. [Sistem Feedback](#5-sistem-feedback)
6. [Sistem Penilaian](#6-sistem-penilaian)
7. [Fitur Pendukung](#7-fitur-pendukung)

---

## 1. Pendahuluan

GengoBot adalah aplikasi pembelajaran bahasa Jepang berbasis AI yang memungkinkan pengguna berlatih percakapan dengan karakter virtual. Aplikasi ini dirancang untuk memberikan pengalaman belajar yang mirip dengan berbicara dengan penutur asli, namun dalam lingkungan yang aman dan supportive.

### 1.1 Tujuan Utama

- Memberikan kesempatan praktik percakapan bahasa Jepang kapan saja
- Menyediakan feedback yang membantu tanpa membuat learner merasa dihakimi
- Membangun kepercayaan diri dalam berkomunikasi menggunakan bahasa Jepang

### 1.2 Teknologi yang Digunakan

GengoBot menggunakan teknologi AI generatif (Large Language Model) yang memungkinkan:

- Percakapan natural dalam bahasa Jepang
- Pengenalan suara (speech-to-text) untuk input berbicara
- Sintesis suara (text-to-speech) untuk mendengarkan respons AI
- Analisis otomatis untuk penilaian dan feedback

---

## 2. Dasar Teori

### 2.1 Kerangka Kurikulum: JF日本語教育スタンダード

Skenario roleplay di GengoBot disusun berdasarkan **JF日本語教育スタンダード Can-do (A1-A2)** dari Japan Foundation. Skenario dibagi ke dalam tiga kategori kehidupan utama:

| Kategori                  | Bahasa Jepang | Contoh Skenario                           |
| ------------------------- | ------------- | ----------------------------------------- |
| **Bekerja**               | 働く          | Wawancara kerja, rapat, telepon kantor    |
| **Bepergian**             | 出かける      | Bertanya arah, memesan tiket, di bandara  |
| **Kehidupan Sehari-hari** | 暮らす        | Berbelanja, di restoran, bertemu tetangga |

Framework Can-do memastikan bahwa setiap task memiliki tujuan komunikatif yang jelas dan terukur, bukan sekadar latihan grammar atau vocabulary terisolasi.

### 2.2 Teori Feedback dalam Pembelajaran Bahasa

GengoBot menerapkan pendekatan **dual-feedback** berdasarkan penelitian terkini dalam Second Language Acquisition (SLA):

#### Implicit Feedback (Selama Percakapan)

Berdasarkan klasifikasi **Lyster & Ranta (1997)**, GengoBot menggunakan dua jenis feedback implisit:

| Jenis                     | Penjelasan                                                                         | Contoh                                                          |
| ------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Recast**                | AI mengulang ucapan user dengan bentuk yang benar, tanpa menyebutkan ada kesalahan | User: "映画を見るました" → AI: "へぇ、映画を**見た**んですね！" |
| **Clarification Request** | AI meminta klarifikasi secara natural ketika tidak mengerti                        | "すみません、もう一度言ってもらえますか？"                      |

**Mengapa Implicit Feedback?**

Menurut **Kubomoto (2010)**, recast adalah metode koreksi implisit yang tidak mengganggu alur komunikasi. Learner mendapat kesempatan untuk menyadari perbedaan antara ucapannya dan bentuk yang benar, tanpa merasa "disalahkan".

#### Explicit Feedback (Setelah Percakapan)

Setelah task selesai, AI memberikan feedback komprehensif yang mencakup:

- Pencapaian tujuan komunikasi
- Koreksi kesalahan grammar dan vocabulary
- Tips penggunaan ekspresi yang lebih natural

**Mengapa Kombinasi Keduanya?**

Penelitian **Yang (2025)** menunjukkan bahwa:

- **Immediate feedback** (implicit, selama percakapan) → Membantu koreksi langsung
- **Delayed feedback** (explicit, setelah selesai) → Mendukung refleksi mendalam dan retensi jangka panjang

GengoBot menggabungkan keduanya untuk memaksimalkan manfaat pembelajaran.

### 2.3 Tiga Aspek Penilaian

Feedback di GengoBot mencakup tiga aspek utama:

| Aspek                  | Deskripsi                            | Contoh                                         |
| ---------------------- | ------------------------------------ | ---------------------------------------------- |
| **Pencapaian Tugas**   | Apakah tujuan komunikasi tercapai?   | Berhasil memesan makanan di restoran           |
| **Ketepatan Bahasa**   | Apakah grammar dan vocabulary benar? | Penggunaan bentuk lampau yang tepat            |
| **Kesesuaian Konteks** | Apakah ekspresi sesuai situasi?      | Menggunakan keigo saat berbicara dengan atasan |

### 2.4 Validitas Penilaian AI

Beberapa penelitian mendukung penggunaan AI untuk penilaian bahasa:

- **Lee (2023)**: Penilaian otomatis ChatGPT terhadap tulisan learner Jepang menunjukkan korelasi signifikan dengan skor tes objektif, menunjukkan reliabilitas yang dapat diandalkan.

- **Lee (2024)**: Perbandingan feedback antara guru berpengalaman dan ChatGPT menunjukkan:
  - **ChatGPT** fokus pada ketepatan grammar dan vocabulary
  - **Guru manusia** fokus pada struktur keseluruhan dan orisinalitas
  - Keduanya saling melengkapi (_complementary_)

GengoBot memanfaatkan kekuatan AI dalam analisis ketepatan bahasa, sambil menjaga tone yang supportive seperti guru manusia.

---

## 3. Mode Percakapan

GengoBot menyediakan dua mode percakapan dengan tujuan berbeda:

### 3.1 Roleplay (Task-Based)

Percakapan dengan skenario dan tujuan pembelajaran yang jelas.

**Karakteristik:**

- Ada skenario spesifik (misalnya: "Kamu mau pesan makanan di restoran")
- Ada learning objectives yang harus dicapai
- Ada penilaian di akhir percakapan
- Cocok untuk latihan terarah dan terukur

**Contoh Skenario:**

| Kategori | Skenario                                 | Level |
| -------- | ---------------------------------------- | ----- |
| 暮らす   | Memperkenalkan diri kepada tetangga baru | N5    |
| 出かける | Menanyakan arah ke stasiun               | N5    |
| 働く     | Menelepon untuk izin sakit               | N4    |
| 暮らす   | Komplain ke petugas apartemen            | N4    |

**Struktur Learning Objectives:**

Setiap task memiliki 3-5 objectives yang harus dicapai, misalnya untuk task "Memesan di Restoran":

1. Menyapa pelayan dengan sopan
2. Menanyakan menu rekomendasi
3. Memesan makanan dan minuman
4. Meminta bill

### 3.2 Ngobrol Bebas (Free Conversation)

Percakapan santai tanpa skenario atau penilaian.

**Karakteristik:**

- Tidak ada tujuan khusus - bebas ngobrol apa saja
- Pilih karakter dengan personality berbeda
- Tidak ada penilaian formal
- Cocok untuk latihan bebas dan membangun kepercayaan diri

**Pilihan Karakter:**

| Karakter | Hubungan | Gaya Bicara                  |
| -------- | -------- | ---------------------------- |
| Teman    | 友達     | Casual, santai, banyak slang |
| Guru     | 先生     | Sopan, edukatif, sabar       |
| Atasan   | 上司     | Formal, profesional          |
| Pacar    | 恋人     | Intimate, casual             |
| Keluarga | 家族     | Hangat, familiar             |

---

## 4. Alur Penggunaan

### 4.1 Alur Roleplay (Task-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: PERSIAPAN                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Pilih skenario dari daftar roleplay                     │
│                                                             │
│  2. Halaman Pre-Task Study:                                 │
│     • Baca skenario dan konteks situasi                    │
│     • Lihat daftar tujuan yang harus dicapai               │
│     • Dengarkan contoh percakapan (opsional)               │
│     • Pelajari vocabulary terkait (opsional)               │
│                                                             │
│  3. Klik "Mulai Percakapan"                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    FASE 2: PERCAKAPAN                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4. AI memulai percakapan sesuai skenario                  │
│     Contoh: "いらっしゃいませ！ご注文はお決まりですか？"    │
│                                                             │
│  5. Kamu merespons dengan:                                 │
│     • Mengetik teks, ATAU                                  │
│     • Merekam suara (tekan tombol mic)                     │
│                                                             │
│  6. AI merespons secara natural                            │
│     • Respons muncul secara real-time (streaming)          │
│     • Jika voice mode, audio diputar otomatis              │
│     • AI memberikan implicit feedback dalam responsnya     │
│                                                             │
│  7. Progress bar menunjukkan objectives yang tercapai      │
│                                                             │
│  8. Lanjutkan percakapan sampai semua objectives tercapai  │
│                                                             │
│  9. Muncul notifikasi: "Kamu sudah mencapai semua tujuan!" │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   FASE 3: REVIEW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  10. Klik "Selesai" untuk mengakhiri                       │
│                                                             │
│  11. AI menganalisis seluruh percakapan                    │
│                                                             │
│  12. Halaman Post-Task Review menampilkan:                 │
│      • Objectives yang tercapai / belum                    │
│      • Koreksi kesalahan bahasa                            │
│      • Tips berbicara lebih natural                        │
│      • Rekomendasi task selanjutnya                        │
│                                                             │
│  13. Pilih: Coba Lagi atau Lanjut ke Task Lain            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Alur Ngobrol Bebas

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Pilih "Ngobrol Bebas" dari menu Kaiwa                  │
│                                                             │
│  2. Pilih karakter yang ingin diajak ngobrol               │
│                                                             │
│  3. Mulai percakapan - bebas topik apa saja                │
│                                                             │
│  4. Gunakan tombol Hint (?) jika butuh bantuan             │
│                                                             │
│  5. Selesaikan kapan saja - tidak ada penilaian            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Input Suara (Voice Mode)

GengoBot mendukung input suara untuk latihan berbicara:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Kamu      │     │   Rekam     │     │   Diubah    │     │    AI       │
│   Bicara    │ ──▶ │   Suara     │ ──▶ │   ke Teks   │ ──▶ │   Respons   │
│             │     │             │     │  (otomatis) │     │  + Audio    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Cara Menggunakan:**

1. Tekan tombol mikrofon atau tahan tombol spasi
2. Bicara dalam bahasa Jepang
3. Lepaskan untuk mengirim
4. AI akan merespons dengan teks DAN audio

---

## 5. Sistem Feedback

### 5.1 Implicit Feedback (Selama Percakapan)

AI memberikan koreksi secara halus dan natural, tanpa secara eksplisit mengatakan "kamu salah".

#### Prinsip Utama:

- AI **tidak pernah** bilang "itu salah" atau "seharusnya..."
- AI **tidak pernah** keluar dari karakter untuk menjelaskan grammar
- AI **tetap** menggunakan bahasa Jepang dalam responsnya
- Koreksi terjadi secara natural dalam konteks percakapan

#### Strategi Feedback:

**1. Recast (Pengulangan dengan Bentuk Benar)**

Ketika AI mengerti maksud user meskipun ada kesalahan, AI merespons menggunakan bentuk yang benar:

```
┌─────────────────────────────────────────────────────────────┐
│ User  : 昨日、映画を見るました。                            │
│         (Salah: bentuk lampau seharusnya 見ました)          │
│                                                             │
│ AI    : へぇ、昨日映画を見たんですね！どんな映画でしたか？  │
│         ↑ AI menggunakan "見た" yang benar secara natural   │
│                                                             │
│ ✓ User bisa menyadari perbedaan tanpa merasa dikoreksi     │
└─────────────────────────────────────────────────────────────┘
```

**2. Clarification Request (Permintaan Klarifikasi)**

Ketika AI tidak mengerti, AI meminta pengulangan secara natural:

```
┌─────────────────────────────────────────────────────────────┐
│ User  : あの... えっと... [ucapan tidak jelas]              │
│                                                             │
│ AI    : すみません、もう一度言ってもらえますか？            │
│         (Maaf, bisa diulang sekali lagi?)                   │
│                                                             │
│ ✓ User diminta mengulang tanpa merasa "disalahkan"         │
└─────────────────────────────────────────────────────────────┘
```

**3. Konfirmasi dengan Reformulasi**

Ketika AI bisa menebak maksud tapi ingin memastikan:

```
┌─────────────────────────────────────────────────────────────┐
│ User  : あそこの... えっと... 食べる場所？                  │
│         (User lupa kata "restoran")                         │
│                                                             │
│ AI    : レストランのことですか？                            │
│         あそこのレストランはとても美味しいですよ！          │
│                                                             │
│ ✓ AI memperkenalkan vocabulary yang tepat secara natural   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Explicit Feedback (Setelah Percakapan)

Setelah task selesai, AI memberikan feedback komprehensif dalam Bahasa Indonesia.

#### Komponen Feedback:

**1. Pencapaian Objektif**

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 OBJEKTIF PERCAKAPAN                                     │
│                                                             │
│  Tercapai: 3/4                                              │
│                                                             │
│  ✅ Menyapa pelayan dengan sopan                            │
│     → Bagus! Kamu menggunakan "すみません" dengan tepat.    │
│                                                             │
│  ✅ Menanyakan menu rekomendasi                             │
│     → Pertanyaan "おすすめは何ですか？" sangat natural!     │
│                                                             │
│  ✅ Memesan makanan                                         │
│     → Kamu berhasil memesan dengan jelas.                  │
│                                                             │
│  ⭕ Meminta bill                                            │
│     → Coba gunakan "お会計お願いします" untuk minta bill.  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**2. Koreksi Bahasa**

```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ PERBAIKAN BAHASA                                        │
│                                                             │
│  ┌────────────────┬────────────────┬──────────────────────┐ │
│  │ Kamu Bilang    │ Seharusnya     │ Penjelasan           │ │
│  ├────────────────┼────────────────┼──────────────────────┤ │
│  │ 食べるたいです │ 食べたいです   │ Bentuk -たい tidak   │ │
│  │                │                │ pakai -る            │ │
│  ├────────────────┼────────────────┼──────────────────────┤ │
│  │ これは何です   │ これは何ですか │ Pertanyaan perlu     │ │
│  │                │                │ partikel か          │ │
│  └────────────────┴────────────────┴──────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**3. Tips Berbicara Natural**

```
┌─────────────────────────────────────────────────────────────┐
│  💡 TIPS BERBICARA LEBIH NATURAL                            │
│                                                             │
│  Situasi: Saat mau memanggil pelayan                       │
│  Ekspresi: 「すみませーん」                                 │
│  Catatan: Perpanjang suara akhir untuk terdengar sopan     │
│           dan tidak terlalu kaku.                          │
│                                                             │
│  Situasi: Saat mau meminta waktu untuk berpikir            │
│  Ekspresi: 「ちょっと待ってください」                       │
│  Catatan: Lebih natural daripada diam saja.                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**4. Rekomendasi Task Selanjutnya**

```
┌─────────────────────────────────────────────────────────────┐
│  📌 REKOMENDASI SELANJUTNYA                                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Membayar di Kasir                                     │ │
│  │ Level: N5 | Kategori: 暮らす                          │ │
│  │ Alasan: Melanjutkan praktik di konteks restoran       │ │
│  │                                         [Mulai]       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Bertanya Menu ke Teman                                │ │
│  │ Level: N5 | Kategori: 暮らす                          │ │
│  │ Alasan: Latihan topik serupa dengan konteks berbeda   │ │
│  │                                         [Mulai]       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Sistem Penilaian

### 6.1 Deteksi Pencapaian Objektif (Real-time)

Selama percakapan berlangsung, sistem secara otomatis mendeteksi apakah learning objectives sudah tercapai.

**Cara Kerja:**

- Sistem menganalisis setiap pertukaran pesan
- Mencocokkan dengan daftar objectives
- Update progress bar secara real-time
- User bisa melihat progress tanpa mengganggu percakapan

**Pendekatan yang Digunakan: LENIENT (Toleran)**

Sistem dirancang untuk mendukung, bukan menghakimi:

| Apa yang User Lakukan                   | Status      | Catatan            |
| --------------------------------------- | ----------- | ------------------ |
| Berhasil melakukan dengan sempurna      | ✅ Tercapai | Confidence tinggi  |
| Mencoba tapi belum sempurna             | ✅ Tercapai | Usaha dihargai     |
| Menyebutkan atau bertanya tentang topik | ✅ Tercapai | Awareness dihitung |
| Tidak menyentuh topik sama sekali       | ⏳ Pending  | Belum tercapai     |

> **Filosofi:** "Pembelajaran adalah tentang praktik dan usaha, bukan kesempurnaan. Berikan keuntungan kepada learner."

### 6.2 Kapan Task Bisa Diselesaikan

Sebelum user bisa mengakhiri task, sistem memvalidasi:

| Kriteria            | Minimum             | Alasan                               |
| ------------------- | ------------------- | ------------------------------------ |
| Jumlah pesan        | ≥ 5 pesan           | Memastikan ada percakapan yang cukup |
| Objectives tercapai | ≥ 70%               | Memastikan tujuan utama tercapai     |
| Durasi              | ≥ 50% dari estimasi | Memastikan tidak terburu-buru        |

### 6.3 Tiga Aspek Penilaian

Sesuai framework yang digunakan, feedback mencakup:

**1. Pencapaian Tugas (Task Achievement)**

- Apakah tujuan komunikatif tercapai?
- Apakah skenario berhasil dijalankan?

**2. Ketepatan Bahasa (Accuracy)**

- Apakah grammar benar?
- Apakah vocabulary tepat?
- Apakah ada kesalahan yang perlu diperbaiki?

**3. Kesesuaian Konteks (Appropriateness)**

- Apakah level kesopanan sesuai?
- Apakah ekspresi sesuai situasi?
- Apakah natural untuk konteks tersebut?

### 6.4 Saran Berdasarkan Hasil

| Pencapaian | Rekomendasi Sistem                                                |
| ---------- | ----------------------------------------------------------------- |
| < 50%      | Review skenario, pelajari vocabulary, coba task lebih mudah       |
| 50-70%     | Fokus ke objectives yang belum tercapai, sarankan retry           |
| 70-99%     | Bagus! Coba lagi untuk hasil sempurna, atau lanjut ke task serupa |
| 100%       | Excellent! Lanjut ke task lebih challenging                       |

---

## 7. Fitur Pendukung

### 7.1 Sistem Hint

Ketika user bingung harus merespons apa, bisa meminta bantuan dengan tombol Hint (?).

**Format Hint:**

```
┌─────────────────────────────────────────────────────────────┐
│  💡 HINT                                                    │
│                                                             │
│  Kamu bisa merespons seperti:                               │
│  • 「はい、お願いします」(Ya, tolong)                       │
│  • 「少し待ってください」(Tunggu sebentar)                  │
│                                                             │
│  Kosakata yang berguna:                                     │
│  • 注文 (chuumon) - pesanan                                 │
│  • メニュー (menyuu) - menu                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Karakteristik Hint:**

- Diberikan dalam Bahasa Indonesia
- Disesuaikan dengan level user (N5-N1)
- Menyertakan 2-3 contoh respons
- Menyertakan vocabulary yang relevan

### 7.2 Vocabulary Popup

Ketika membaca respons AI, user bisa mengklik kata Jepang untuk melihat artinya.

**Informasi yang Ditampilkan:**

- Kata dalam kanji/hiragana
- Cara baca (reading)
- Arti dalam Bahasa Indonesia
- Kelas kata (kata kerja, kata sifat, dll)
- Level JLPT
- Tombol untuk menambahkan ke deck belajar

### 7.3 Pre-Task Study

Sebelum memulai roleplay, user bisa mempersiapkan diri:

**Komponen Pre-Task:**

1. **Skenario** - Deskripsi situasi yang akan dihadapi
2. **Learning Objectives** - Daftar tujuan yang harus dicapai
3. **Contoh Audio** - Rekaman contoh percakapan serupa
4. **Deck Terkait** - Flashcard vocabulary yang relevan

### 7.4 Input Mode

User bisa memilih cara berkomunikasi:

| Mode      | Cara Penggunaan           | Keuntungan                                   |
| --------- | ------------------------- | -------------------------------------------- |
| **Text**  | Ketik di keyboard         | Bisa berpikir lebih lama, cocok untuk pemula |
| **Voice** | Tekan mic atau hold spasi | Latihan pronunciation, lebih natural         |

### 7.5 Credit System

Penggunaan AI memerlukan kredit yang dihitung berdasarkan:

- Panjang percakapan
- Penggunaan voice mode
- Permintaan hint
- Generate assessment

**Informasi Kredit:**

- Saldo ditampilkan di dashboard
- Warning muncul jika kredit hampir habis
- Free tier: limit harian
- Paid tier: kuota bulanan

---

## Ringkasan

GengoBot menyediakan pengalaman belajar percakapan bahasa Jepang yang:

| Aspek                          | Pendekatan                                           |
| ------------------------------ | ---------------------------------------------------- |
| **Kurikulum**                  | Berbasis JF日本語教育スタンダード Can-do             |
| **Feedback Selama Percakapan** | Implicit (recast & clarification request)            |
| **Feedback Setelah Selesai**   | Explicit (komprehensif dalam Bahasa Indonesia)       |
| **Penilaian**                  | Toleran - menghargai usaha, bukan hanya kesempurnaan |
| **Aspek Penilaian**            | Task achievement, accuracy, appropriateness          |
| **Dukungan**                   | Hint, vocabulary popup, pre-task study               |

---

---

**Last Updated:** 2024-12

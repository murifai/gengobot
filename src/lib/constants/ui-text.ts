/**
 * UI Text Constants - Bahasa Indonesia
 * Centralized localization for all user-facing text
 */

export const UI_TEXT = {
  // Dashboard
  dashboard: {
    title: 'Beranda',
    welcomeBack: 'Selamat datang kembali! Mari lanjutkan perjalanan belajar bahasa Jepangmu',
    weeklyActivity: 'Aktivitas Mingguan',
    weeklyActivityDescription: 'Aktivitas belajarmu dalam 7 hari terakhir',
    recentActivity: 'Aktivitas Terbaru',
    recentActivityDescription: 'Aktivitas belajar terakhirmu',
    speakingMinutes: 'Menit Latihan Kaiwa',
    masteredCards: 'Kartu yang Sudah Hafal',
    noActivity: 'Belum ada aktivitas',
    startLearning: 'Mulai belajar untuk melihat progressmu di sini!',
    sessionsThisWeek: 'sesi minggu ini',
    ofTotalCards: 'dari total',
    days: 'hari',
    // Section headers
    drillSection: 'Drill & Flashcard',
    kaiwaSection: 'Percakapan',
    // Kaiwa stats
    roleplayMinutes: 'Menit Roleplay',
    freeChatMinutes: 'Menit Kaiwa Bebas',
    roleplaySessions: 'sesi roleplay',
    freeChatConversations: 'percakapan',
  },

  // Activity Chart
  activityChart: {
    kaiwaMinutes: 'Menit Kaiwa',
    roleplayMinutes: 'Menit Roleplay',
    freeChatMinutes: 'Menit Kaiwa Bebas',
    cardsReviewed: 'Kartu Dipelajari',
    minutes: 'menit',
    cards: 'kartu',
  },

  // Recent Activity
  recentActivityItem: {
    completed: 'Selesai',
    reviewed: 'Dipelajari',
    score: 'Skor',
  },

  // Drill/Flashcard
  drill: {
    title: 'Drill',
    study: 'Belajar',
    newCards: 'Kartu Baru',
    memorized: 'Hafal',
    notMemorized: 'Belum Hafal',
    totalCards: 'Total Kartu',
    flip: 'Balik',
    flipCard: 'Balik Kartu',
    again: 'Lagi',
    hard: 'Sulit',
    good: 'Bagus',
    easy: 'Mudah',
    nextCard: 'Kartu Berikutnya',
    previousCard: 'Kartu Sebelumnya',
    sessionComplete: 'Sesi Belajar Selesai!',
    sessionCompleteMessage: 'Hebat! Kamu telah menyelesaikan sesi belajar untuk deck',
    viewProgress: 'Lihat progresmu di bawah ini',
    accuracy: 'Akurasi',
    timeSpent: 'Waktu Belajar',
    tapToFlip: 'Tap untuk balik kartu',
    noCardsInDeck: 'Tidak ada kartu dalam dek ini.',
    unknownCardType: 'Jenis kartu tidak dikenal',
    failedToSaveRating: 'Gagal menyimpan rating. Silakan coba lagi.',
  },

  // Deck Statistics
  deckStats: {
    studyStreak: 'Streak Belajar',
    cardsLearned: 'Kartu Dipelajari',
    masteredCards: 'Kartu Hafal',
    studyTime: 'Waktu Belajar',
    deckProgress: 'Progress Deck',
    recentSessions: 'Sesi Terakhir',
    sessions: 'sesi',
    ofTotal: 'dari total',
  },

  // Card Labels
  cardLabels: {
    meaning: 'Arti',
    example: 'Contoh',
    usageNote: 'Catatan Penggunaan',
    notes: 'Catatan',
  },

  // Kaiwa/Roleplay
  kaiwa: {
    title: 'Kaiwa',
    chatMode: 'Mode Chat',
    textVoiceEnabled: 'Teks & Suara aktif',
    roleplay: 'Roleplay',
    freeChat: 'Kaiwa Bebas',
    startConversation: 'Mulai Percakapan',
    endConversation: 'Akhiri Percakapan',
    sendMessage: 'Kirim Pesan',
    typeMessage: 'Ketik pesan...',
    recording: 'Merekam...',
    processing: 'Memproses...',
    loadingCharacters: 'Memuat karakter...',
    noCharactersAvailable: 'Tidak ada karakter tersedia. Buat karakter untuk mulai chat!',
    createCharacter: 'Buat Karakter',
    selectCharacter:
      'Pilih karakter untuk mulai chat. Kamu bisa menggunakan teks dan suara dalam percakapan.',
    noDescription: 'Tidak ada deskripsi',
  },

  // Feedback/Assessment
  feedback: {
    title: 'Feedback',
    achievements: 'Apa yang Kamu Capai',
    strengths: 'Kelebihan Kamu',
    whatYouDidWell: 'Yang Kamu Lakukan dengan Baik',
    weaknesses: 'Kekurangan Kamu',
    areasToFocus: 'Area yang Perlu Diperhatikan',
    corrections: 'Koreksi Grammar dan Vocabulary',
    recommendations: 'Rekomendasi',
    nextSteps: 'Langkah Selanjutnya',
    deckRecommendations: 'Deck yang Disarankan',
    taskRecommendations: 'Task yang Disarankan',
    overallScore: 'Skor Keseluruhan',
    overallAssessment: 'Penilaian Keseluruhan',
    excellent: 'Sangat Baik',
    good: 'Baik',
    needsImprovement: 'Perlu Perbaikan',
    taskCompleted: 'Task Selesai!',
    taskIncomplete: 'Task Belum Selesai',
    greatJob: 'Kerja bagus menyelesaikan task ini',
    completedObjectives: 'Kamu menyelesaikan',
    ofObjectives: 'dari',
    objectives: 'objektif',
    learningObjectives: 'Tujuan Pembelajaran',
    progress: 'Progress',
    demonstratedInConversation: 'Ditunjukkan dalam percakapan',
    feedbackInsights: 'Feedback & Insight',
    retryTask: 'Ulangi Task',
    backToTasks: 'Kembali ke Tasks',
  },

  // Profile
  profile: {
    title: 'Profil',
    editProfile: 'Edit Profil',
    settings: 'Pengaturan',
    progress: 'Progress',
    subscription: 'Langganan',
    logout: 'Keluar',
    characters: 'Karakter',
  },

  // Common
  common: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    retry: 'Coba Lagi',
    tryAgain: 'Coba Lagi',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    create: 'Buat',
    search: 'Cari',
    filter: 'Filter',
    sort: 'Urutkan',
    viewAll: 'Lihat Semua',
    back: 'Kembali',
    backToDashboard: 'Kembali ke Dashboard',
    backToDeckList: 'Kembali ke Daftar Deck',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    confirm: 'Konfirmasi',
    yes: 'Ya',
    no: 'Tidak',
    done: 'Selesai',
    exit: 'Keluar',
    close: 'Tutup',
    minutes: 'menit',
    hours: 'jam',
    cards: 'kartu',
    recently: 'Baru saja',
  },

  // Time
  time: {
    justNow: 'Baru saja',
    minutesAgo: 'menit yang lalu',
    hoursAgo: 'jam yang lalu',
    daysAgo: 'hari yang lalu',
    weeksAgo: 'minggu yang lalu',
    today: 'Hari ini',
    yesterday: 'Kemarin',
    thisWeek: 'Minggu ini',
  },

  // Difficulty Levels
  difficulty: {
    N5: 'Pemula (N5)',
    N4: 'Dasar (N4)',
    N3: 'Menengah (N3)',
    N2: 'Lanjutan (N2)',
    N1: 'Mahir (N1)',
  },

  // Card Types
  cardTypes: {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    kanji: 'Kanji',
    vocabulary: 'Kosakata',
    grammar: 'Tata Bahasa',
  },

  // Validation Messages
  validation: {
    required: 'Wajib diisi',
    invalidEmail: 'Email tidak valid',
    passwordTooShort: 'Password terlalu pendek',
    passwordMismatch: 'Password tidak cocok',
  },

  // Error Messages
  errors: {
    generic: 'Terjadi kesalahan. Silakan coba lagi.',
    networkError: 'Kesalahan jaringan. Periksa koneksi internet Anda.',
    notFound: 'Tidak ditemukan',
    unauthorized: 'Akses tidak diizinkan',
    serverError: 'Kesalahan server. Silakan coba lagi nanti.',
  },

  // Success Messages
  success: {
    saved: 'Berhasil disimpan',
    deleted: 'Berhasil dihapus',
    updated: 'Berhasil diperbarui',
    created: 'Berhasil dibuat',
  },
} as const;

// Helper function to format relative time in Indonesian
export function formatRelativeTimeID(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return UI_TEXT.time.justNow;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${UI_TEXT.time.minutesAgo}`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${UI_TEXT.time.hoursAgo}`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ${UI_TEXT.time.daysAgo}`;
  return `${Math.floor(diffInSeconds / 604800)} ${UI_TEXT.time.weeksAgo}`;
}

// Type for accessing UI_TEXT
export type UITextType = typeof UI_TEXT;

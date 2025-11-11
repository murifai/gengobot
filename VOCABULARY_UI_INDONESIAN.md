# UI Kosakata - Bahasa Indonesia

## Perubahan

### 1. Bahasa Interface → Bahasa Indonesia

Semua label dan teks UI telah diubah ke Bahasa Indonesia:

| Sebelum (English)               | Setelah (Indonesian)       |
| ------------------------------- | -------------------------- |
| Vocabulary Details              | Detail Kosakata            |
| Reading (Katakana)              | _(dihapus)_                |
| Dictionary Form                 | Bentuk Kamus               |
| Part of Speech                  | Jenis Kata                 |
| Conjugation                     | Konjugasi                  |
| Click anywhere outside to close | Klik di luar untuk menutup |

### 2. Reading Format → Romaji

**Sebelum**: Katakana (シマス)
**Setelah**: Romaji (shimasu)

Reading sekarang ditampilkan dalam format **romaji** yang lebih mudah dibaca oleh learners Indonesia.

### 3. Verb Phrase Components → Dihapus

Bagian "Verb Phrase Components" telah dihapus untuk menyederhanakan tampilan.

**Sebelum**:

```
Verb Phrase Components:
[し] [ます]
These parts were combined for easier learning
```

**Setelah**: _(dihapus)_

## Format Display Baru

### Contoh: します (shimasu)

```
┌─────────────────────────────────┐
│ Detail Kosakata                 │
├─────────────────────────────────┤
│                                 │
│          します                  │
│        します                    │ ← Hiragana
│       (shimasu)                 │ ← Romaji
│                                 │
├─────────────────────────────────┤
│ Bentuk Kamus: する              │
│ Jenis Kata: Verba               │
│                                 │
├─────────────────────────────────┤
│ Klik di luar untuk menutup      │
└─────────────────────────────────┘
```

### Contoh: 食べます (tabemasu)

```
┌─────────────────────────────────┐
│ Detail Kosakata                 │
├─────────────────────────────────┤
│                                 │
│        食べます                  │
│        たべます                  │ ← Hiragana
│       (tabemasu)                │ ← Romaji
│                                 │
├─────────────────────────────────┤
│ Bentuk Kamus: 食べる             │
│ Jenis Kata: Verba               │
│                                 │
└─────────────────────────────────┘
```

## Fitur Romaji Conversion

### Implementasi

Fungsi `katakanaToRomaji()` di [kuromoji-parser.ts](src/lib/utils/kuromoji-parser.ts:138-280) mengkonversi katakana ke romaji dengan dukungan:

#### ✅ Basic Conversion

```
カ → ka
シ → shi
ツ → tsu
```

#### ✅ Small Tsu (ッ) - Consonant Doubling

```
ガッコウ → gakkou
マッチ → matchi
```

#### ✅ Combination Sounds (きゃ, しゅ, ちょ)

```
キャ → kya
シュ → shu
チョ → cho
リュウ → ryuu
```

#### ✅ Long Vowels (ー)

```
コーヒー → koohii
ラーメン → raamen
```

### Contoh Konversi

| Katakana             | Romaji            | Contoh Kata    |
| -------------------- | ----------------- | -------------- |
| シマス               | shimasu           | します         |
| タベマス             | tabemasu          | 食べます       |
| ミマス               | mimasu            | 見ます         |
| イキマス             | ikimasu           | 行きます       |
| ベンキョウシテイマス | benkyoushiteimasu | 勉強しています |

## Jenis Kata dalam Bahasa Indonesia

| 日本語 | English        | Bahasa Indonesia |
| ------ | -------------- | ---------------- |
| 名詞   | Noun           | **Nomina**       |
| 動詞   | Verb           | **Verba**        |
| 形容詞 | Adjective      | **Adjektiva**    |
| 副詞   | Adverb         | **Adverbia**     |
| 助詞   | Particle       | **Partikel**     |
| 助動詞 | Auxiliary Verb | **Verba Bantu**  |
| 接続詞 | Conjunction    | **Konjungsi**    |
| 連体詞 | Adnominal      | **Prenominal**   |
| 感動詞 | Interjection   | **Interjeksi**   |

## Keunggulan UI Baru

### 1. Lebih Sederhana

- Tidak ada informasi teknis yang membingungkan
- Fokus pada informasi yang dibutuhkan learners
- Layout lebih bersih dan mudah dibaca

### 2. Romaji untuk Learners Indonesia

- Learners Indonesia lebih familiar dengan romaji
- Lebih mudah membaca dan mengingat pronunciation
- Tetap menampilkan hiragana untuk referensi

### 3. Bahasa Indonesia

- Lebih mudah dipahami oleh learners Indonesia
- Konsisten dengan target audience
- Mengurangi cognitive load

## Files yang Dimodifikasi

1. **[src/lib/utils/kuromoji-parser.ts](src/lib/utils/kuromoji-parser.ts)**
   - Added: `katakanaToRomaji()` function (lines 138-280)
   - Updated: `formatPartOfSpeech()` dengan istilah Indonesia (lines 97-115)

2. **[src/components/vocabulary/VocabularyDetail.tsx](src/components/vocabulary/VocabularyDetail.tsx)**
   - Updated: Header ke "Detail Kosakata"
   - Updated: Labels ke Bahasa Indonesia
   - Added: Romaji display
   - Removed: Verb Phrase Components section
   - Updated: Close message ke Indonesian

## Testing

### Manual Test Cases

1. **Test Basic Verb**

   ```
   Input: します
   Expected:
   - Word: します
   - Hiragana: します
   - Romaji: (shimasu)
   - Bentuk Kamus: する
   - Jenis Kata: Verba
   ```

2. **Test Compound Verb**

   ```
   Input: 食べています
   Expected:
   - Word: 食べています
   - Hiragana: たべています
   - Romaji: (tabeteimasu)
   - Bentuk Kamus: 食べる
   - Jenis Kata: Verba
   ```

3. **Test Noun**
   ```
   Input: 学生
   Expected:
   - Word: 学生
   - Hiragana: がくせい
   - Romaji: (gakusei)
   - Jenis Kata: Nomina
   ```

## Future Improvements

Potential enhancements untuk nanti:

1. **English Translation**: Tambahkan terjemahan Bahasa Inggris
2. **Indonesian Translation**: Tambahkan terjemahan Bahasa Indonesia
3. **Example Sentences**: Contoh kalimat penggunaan
4. **Audio Pronunciation**: Text-to-speech untuk pronunciation
5. **JLPT Level**: Badge level JLPT untuk vocab
6. **Save to Flashcards**: Simpan ke flashcard deck user

## Related Documentation

- [VOCABULARY_PARSER.md](VOCABULARY_PARSER.md) - Overall feature documentation
- [VERB_PHRASE_GROUPING.md](VERB_PHRASE_GROUPING.md) - Verb phrase merging feature

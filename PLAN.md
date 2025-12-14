# Bug Fix Plan

## Bug Summary

| #   | Bug                                                               | Status     |
| --- | ----------------------------------------------------------------- | ---------- |
| 1   | Button "Coba Lagi" tidak berfungsi di hasil belajar deck          | ⏳ Pending |
| 2   | Mulai roleplay dari feedback langsung ke chatroom (skip pretask)  | ⏳ Pending |
| 3   | Reset chat roleplay tidak mereset learn objectives                | ⏳ Pending |
| 4   | Filter tidak bisa di-collapse                                     | ⏳ Pending |
| 5   | Label di Profile masih "Free" padahal sudah upgrade ke Pro        | ⏳ Pending |
| 6   | Tidak ada notice ketika semua objective selesai                   | ⏳ Pending |
| 7   | Hilangkan keterangan level bahasa Jepang (cukup JLPT N1, N2, dst) | ⏳ Pending |
| 8   | Riwayat penggunaan kredit disederhanakan per-sesi                 | ✅ Done    |
| 9   | Hilangkan Penggunaan Kredit (30 Hari Terakhir)                    | ⏳ Pending |
| 10  | Bug mode gelap harus klik 2x saat baru daftar                     | ⏳ Pending |

---

## Detailed Analysis & Fix Plan

### Bug 1: Button "Coba Lagi" tidak berfungsi di hasil belajar deck

**File:** [DeckLearningWithStats.tsx:182-187](src/components/deck/DeckLearningWithStats.tsx#L182-L187)

**Problem:**
Button "Coba Lagi" menggunakan `<Link href={/app/drill/${deck.id}}>` yang menavigasi ke halaman drill deck. Namun karena session sebelumnya mungkin masih ada atau deck sudah di-mark complete, navigasi tidak berfungsi seperti yang diharapkan.

**Fix:**

- Ubah dari `<Link>` menjadi `<button>` dengan onClick handler
- Buat fungsi untuk mereset session dan memulai sesi baru dengan navigasi yang proper
- Pastikan session baru dibuat atau session lama direset sebelum memulai

**Implementation:**

```tsx
// Tambah fungsi handleRetry
const handleRetry = async () => {
  // Create new session atau navigate dengan force refresh
  router.push(`/app/drill/decks/${deck.id}/study?retry=true`);
};
```

---

### Bug 2: Mulai roleplay dari feedback langsung ke chatroom (skip pretask)

**File:** [TaskAttemptClientStreaming.tsx:344-380](src/components/app/kaiwa/TaskAttemptClientStreaming.tsx#L344-L380)

**Problem:**
Fungsi `onStartRecommendedTask` langsung membuat attempt baru dan navigasi ke chatroom (`/app/kaiwa/roleplay/${taskId}/attempt/${newAttempt.id}`) tanpa melalui PreTask page.

**Current Flow:** Feedback → Create Attempt → Chatroom
**Expected Flow:** Feedback → PreTask → Create Attempt → Chatroom

**Fix:**
Ubah navigasi dari langsung ke attempt page menjadi ke pretask page:

```tsx
// Dari:
router.push(`/app/kaiwa/roleplay/${taskId}/attempt/${newAttempt.id}`);
// Menjadi:
router.push(`/app/kaiwa/roleplay/${taskId}`); // PreTask page
```

Dan hapus pembuatan attempt di sini, biarkan PreTask yang handle.

---

### Bug 3: Reset chat roleplay tidak mereset learn objectives

**File:** [TaskAttemptClientStreaming.tsx:247-268](src/components/app/kaiwa/TaskAttemptClientStreaming.tsx#L247-L268)

**Problem:**
Fungsi `resetChat()` hanya mereset:

- `conversationHistory` di server
- `messages` di client via `resetMessages()`

Tapi tidak memanggil `resetProgress()` dari hook `useTaskFeedbackProgress`.

**Fix:**
Tambahkan call ke `resetProgress()` dalam fungsi `resetChat()`:

```tsx
const resetChat = async () => {
  try {
    // ... existing code ...
    resetMessages();
    resetProgress(); // Tambahkan ini untuk reset objectives
  } catch (err) {
    // ...
  }
};
```

Perlu juga expose `resetProgress` dari hook destructuring.

---

### Bug 4: Filter bisa di-collapse

**File:** [TasksClient.tsx](src/components/app/kaiwa/TasksClient.tsx)

**Analysis:**
Setelah review, filter section di TasksClient.tsx (line 129-241) tidak memiliki fitur collapse untuk seluruh section. Hanya dropdown kategori dan subkategori yang bisa di-toggle.

**Current State:**

- Filter section selalu tampil
- Ada `isCategoryOpen` dan `isSubcategoryOpen` untuk dropdown
- Tidak ada state untuk collapse seluruh filter section

**Fix:**
Tambahkan fitur collapse untuk seluruh filter section:

1. Tambah state `isFilterOpen` dengan default `true`
2. Wrap konten filter dengan collapsible behavior
3. Tambah toggle button di header "Filter"

**Implementation:**

```tsx
const [isFilterOpen, setIsFilterOpen] = useState(true);

// Di JSX - ubah header menjadi clickable:
<div className="mb-6 bg-card border-2 border-border rounded-base shadow-shadow">
  <button
    onClick={() => setIsFilterOpen(!isFilterOpen)}
    className="w-full p-4 flex items-center justify-between"
  >
    <h2 className="text-lg font-bold text-foreground">Filter</h2>
    <ChevronDown className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
  </button>
  {isFilterOpen && <div className="px-4 pb-4">{/* existing filter content */}</div>}
</div>;
```

---

### Bug 5: Label di Profile masih "Free" padahal sudah upgrade ke Pro

**Files:**

- [ProfileHeader.tsx:41-43](src/components/app/profile/ProfileHeader.tsx#L41-L43)
- [SubscriptionTab.tsx:81-89](src/components/app/profile/tabs/SubscriptionTab.tsx#L81-L89)

**Problem:**
ProfileHeader menggunakan `user.subscriptionPlan` langsung:

```tsx
<Badge variant={user.subscriptionPlan === 'premium' ? 'default' : 'secondary'}>
  {user.subscriptionPlan === 'premium' ? 'Premium' : 'Free'}
</Badge>
```

Sedangkan SubscriptionTab menggunakan `SubscriptionTier` enum (FREE, BASIC, PRO).

**Root Cause:**

- Data `user.subscriptionPlan` tidak terupdate setelah upgrade
- Atau mismatch antara field `subscriptionPlan` (string 'premium') vs `tier` (enum SubscriptionTier.PRO)

**Fix:**

1. Sinkronkan penggunaan tier di ProfileHeader dengan yang di SubscriptionTab
2. Gunakan data dari subscription hook atau pastikan data user di-refresh setelah upgrade
3. Update logic untuk menggunakan SubscriptionTier enum:

```tsx
// Import tier dan gunakan konsisten
const tierLabel = user.tier === 'PRO' ? 'Pro' : user.tier === 'BASIC' ? 'Basic' : 'Free';
```

---

### Bug 6: Tidak ada notice ketika semua objective selesai

**File:** [CompletionSuggestion.tsx](src/components/task/CompletionSuggestion.tsx)

**Problem:**
Component `CompletionSuggestion` sudah ada dan menampilkan notice ketika semua objectives completed. Perlu verifikasi apakah component ini ditampilkan dengan benar.

**Current Implementation:**

- Hook `useTaskFeedbackProgress` sudah set `completionSuggested = true` ketika `allObjectivesCompleted && totalMessages > 0`
- `CompletionSuggestion` ditampilkan berdasarkan `taskProgress.completionSuggested`

**Possible Issue:**

- Component mungkin tidak ditampilkan di UI
- Atau kondisi tidak terpenuhi

**Fix:**
Verifikasi apakah `StreamingChatInterface` menampilkan `CompletionSuggestion` dengan benar ketika `taskProgress.completionSuggested === true`.

---

### Bug 7: Hilangkan keterangan level bahasa Jepang

**File:** [PersonalTab.tsx:13-19](src/components/app/profile/tabs/PersonalTab.tsx#L13-L19)

**Current:**

```tsx
const proficiencyLabels: Record<string, string> = {
  N5: 'N5 - Pemula',
  N4: 'N4 - Dasar',
  N3: 'N3 - Menengah',
  N2: 'N2 - Mahir',
  N1: 'N1 - Expert',
};
```

**Fix:**
Ubah menjadi format JLPT saja:

```tsx
const proficiencyLabels: Record<string, string> = {
  N5: 'JLPT N5',
  N4: 'JLPT N4',
  N3: 'JLPT N3',
  N2: 'JLPT N2',
  N1: 'JLPT N1',
};
```

Juga perlu update di:

- [EditProfileSheet.tsx](src/components/app/profile/forms/EditProfileSheet.tsx)
- [EditProfilePage.tsx](src/components/app/profile/EditProfilePage.tsx)

---

### Bug 8: Riwayat penggunaan kredit disederhanakan per-sesi

**File:** [UsageHistory.tsx](src/components/subscription/UsageHistory.tsx)

**Current Behavior:**

- Menampilkan setiap transaksi token secara detail
- Expandable untuk melihat detail per-token (input/output tokens, audio tokens, dll)
- Format per-pengeluaran token

**Required Changes:**

1. Agregasi transaksi per sesi (berdasarkan `referenceId` yang sama atau session ID)
2. Tampilkan hanya:
   - Nama sesi (tipe aktivitas)
   - Total kredit yang digunakan per sesi
   - Saldo setelah sesi
   - Tanggal dan jam
3. Hilangkan collapse/expand dengan detail token

**Implementation:**

- Modifikasi API untuk mengembalikan data yang sudah diagregasi per sesi
- Atau agregasi di frontend berdasarkan referenceId/attemptId
- Simplify UI component

---

### Bug 9: Hilangkan Penggunaan Kredit (30 Hari Terakhir)

**File:** [billing/page.tsx:363-375](<src/app/(app)/billing/page.tsx#L363-L375>)

**Location Found:**
Di halaman billing (`src/app/(app)/billing/page.tsx`) line 363-375:

```tsx
{
  /* Credit Usage Chart */
}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base">
      <BarChart3 className="h-5 w-5" />
      Penggunaan Kredit (30 Hari Terakhir)
    </CardTitle>
    <CardDescription>Lihat pola penggunaan kredit harian kamu</CardDescription>
  </CardHeader>
  <CardContent>
    <CreditUsageChart />
  </CardContent>
</Card>;
```

**Fix:**
Hapus atau comment out seluruh Card component yang berisi `CreditUsageChart` (line 363-375).

---

### Bug 10: Bug mode gelap harus klik 2x saat baru daftar

**File:** [theme-toggle.tsx](src/components/ui/theme-toggle.tsx)

**Problem:**
Ketika user baru mendaftar, theme toggle perlu diklik 2x untuk beralih dari dark ke light mode.

**Root Cause Analysis:**

```tsx
const isDark = theme === 'dark';
```

Saat mounted pertama kali, `theme` mungkin undefined atau 'system'. Jadi `isDark` = false meskipun tampilan sebenarnya dark.

Klik pertama: `setTheme('light')` tapi karena sudah dianggap light, tidak ada perubahan visual
Klik kedua: baru berubah

**Fix:**
Perbaiki pengecekan `isDark` untuk handle 'system' theme:

```tsx
const { theme, resolvedTheme, setTheme } = useTheme();

// Gunakan resolvedTheme untuk actual displayed theme
const isDark = resolvedTheme === 'dark';
```

`resolvedTheme` memberikan actual theme yang sedang ditampilkan, termasuk ketika system preference dark.

---

## Implementation Order (Prioritas)

1. **Bug 10** - Dark mode (Quick fix, UX impact tinggi untuk user baru)
2. **Bug 5** - Profile label Pro/Free (Data accuracy)
3. **Bug 7** - JLPT label (Quick fix, simple string change)
4. **Bug 3** - Reset objectives (Logic fix)
5. **Bug 1** - Coba lagi button (Navigation fix)
6. **Bug 2** - Skip pretask (Navigation flow)
7. **Bug 6** - Completion notice (Verify existing implementation)
8. **Bug 8 & 9** - Usage history simplification (Larger refactor)
9. **Bug 4** - Filter collapse (Need more analysis)

---

## Files to Modify

| File                                                      | Bugs        |
| --------------------------------------------------------- | ----------- |
| `src/components/ui/theme-toggle.tsx`                      | #10         |
| `src/components/app/profile/ProfileHeader.tsx`            | #5          |
| `src/components/app/profile/tabs/PersonalTab.tsx`         | #7          |
| `src/components/app/profile/forms/EditProfileSheet.tsx`   | #7          |
| `src/components/app/kaiwa/TaskAttemptClientStreaming.tsx` | #2, #3      |
| `src/components/deck/DeckLearningWithStats.tsx`           | #1          |
| `src/components/subscription/UsageHistory.tsx`            | #8          |
| `src/app/(app)/billing/page.tsx`                          | #9          |
| `src/components/app/kaiwa/TasksClient.tsx`                | #4          |
| `src/components/chat/StreamingChatInterface.tsx`          | #6 (verify) |

---

## Additional Notes

### Bug 6 - Verifikasi Diperlukan

Perlu mengecek `StreamingChatInterface.tsx` untuk memastikan `CompletionSuggestion` component ditampilkan ketika `taskProgress.completionSuggested === true`.

### Bug 8 - Opsi Implementasi

Dua pendekatan untuk simplifikasi riwayat penggunaan:

1. **Frontend aggregation**: Agregasi data di component berdasarkan `referenceId`
2. **Backend aggregation**: Modifikasi API `/api/subscription/history` untuk return data per-sesi

Rekomendasi: Mulai dengan frontend aggregation untuk quick fix, lalu refactor ke backend jika perlu.

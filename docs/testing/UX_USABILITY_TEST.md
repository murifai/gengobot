# Gengobot - UX Usability Test (User Experience Evaluation)

> **Version**: 2.0
> **Last Updated**: 2024-11-29
> **Purpose**: Evaluasi aspek UX untuk identifikasi area yang perlu direvisi/diperbaiki
> **Total Checkpoints**: 215 items

---

## Overview

Dokumen ini berisi checklist evaluasi UX untuk mengidentifikasi masalah usability dan area yang perlu diperbaiki. Evaluasi mencakup:

- **Nielsen's 10 Heuristics** - Standar industri untuk usability
- **Specific UX Areas** - Evaluasi per fitur
- **Task-Based Testing** - Observasi user melakukan task
- **SUS Score** - System Usability Scale
- **Recommendations** - Prioritas perbaikan

---

## Skala Penilaian

| Score | Rating       | Deskripsi                        | Action Required |
| ----- | ------------ | -------------------------------- | --------------- |
| 1     | Sangat Buruk | Tidak dapat digunakan, blocking  | Redesign total  |
| 2     | Buruk        | Banyak masalah, frustrasi tinggi | Perbaikan major |
| 3     | Cukup        | Beberapa masalah, usable         | Perbaikan minor |
| 4     | Baik         | Minor issues, experience baik    | Nice to have    |
| 5     | Sangat Baik  | Optimal, tidak ada masalah       | Maintain        |

## Severity Rating untuk Issues

| Severity    | Level | Deskripsi                        | Timeline              |
| ----------- | ----- | -------------------------------- | --------------------- |
| 🔴 Critical | 4     | Mencegah user menyelesaikan task | Fix segera (< 24 jam) |
| 🟠 Major    | 3     | Menyebabkan frustrasi signifikan | Fix dalam sprint ini  |
| 🟡 Minor    | 2     | Mengganggu tapi bisa diatasi     | Fix dalam backlog     |
| 🟢 Cosmetic | 1     | Masalah visual/estetika kecil    | Nice to have          |

---

## BAGIAN 1: NIELSEN'S 10 USABILITY HEURISTICS

### H1. Visibility of System Status

_Apakah sistem selalu memberi tahu user apa yang sedang terjadi?_

| ID     | Checkpoint                                | Area               | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ----------------------------------------- | ------------------ | ----------- | ------------ | -------- | -------------- |
| H1-001 | Loading indicator saat fetch data         | Global             |             |              |          |                |
| H1-002 | Progress indicator saat upload file       | Profile, Character |             |              |          |                |
| H1-003 | Feedback visual saat button diklik        | Global             |             |              |          |                |
| H1-004 | Status recording saat voice input         | Kaiwa              |             |              |          |                |
| H1-005 | Progress bar roleplay objectives          | Roleplay           |             |              |          |                |
| H1-006 | Credit balance update real-time           | Subscription       |             |              |          |                |
| H1-007 | Message sending indicator (pending state) | Chat               |             |              |          |                |
| H1-008 | AI typing/thinking indicator              | Chat               |             |              |          |                |
| H1-009 | Session timer/duration display            | Kaiwa              |             |              |          |                |
| H1-010 | Download/export progress indicator        | Drill              |             |              |          |                |
| H1-011 | Form submission feedback (success/fail)   | Global             |             |              |          |                |
| H1-012 | Network connection status indicator       | Global             |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H2. Match Between System and Real World

_Apakah sistem menggunakan bahasa dan konsep yang familiar bagi user?_

| ID     | Checkpoint                                         | Area       | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | -------------------------------------------------- | ---------- | ----------- | ------------ | -------- | -------------- |
| H2-001 | Terminologi sesuai target user (learner Indonesia) | Global     |             |              |          |                |
| H2-002 | Icon intuitif dan mudah dipahami                   | Global     |             |              |          |                |
| H2-003 | Label menu jelas dan deskriptif                    | Navigation |             |              |          |                |
| H2-004 | JLPT level explanation untuk pemula                | Onboarding |             |              |          |                |
| H2-005 | Penjelasan fitur dalam bahasa sederhana            | Landing    |             |              |          |                |
| H2-006 | Konsistensi bahasa (ID/EN/JP) tidak membingungkan  | Global     |             |              |          |                |
| H2-007 | Metaphor yang tepat (deck=kartu, drill=latihan)    | Drill      |             |              |          |                |
| H2-008 | Format tanggal/waktu lokal Indonesia               | Global     |             |              |          |                |
| H2-009 | Format mata uang Rupiah yang benar                 | Payment    |             |              |          |                |
| H2-010 | Error messages dalam bahasa yang dipahami user     | Global     |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### H3. User Control and Freedom

_Apakah user bisa dengan mudah keluar dari situasi yang tidak diinginkan?_

| ID     | Checkpoint                                 | Area             | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ------------------------------------------ | ---------------- | ----------- | ------------ | -------- | -------------- |
| H3-001 | Back button berfungsi sesuai ekspektasi    | Global           |             |              |          |                |
| H3-002 | Cancel button tersedia di semua form       | Global           |             |              |          |                |
| H3-003 | Undo action tersedia (delete, edit)        | Drill, Character |             |              |          |                |
| H3-004 | Exit/quit dari roleplay session kapan saja | Roleplay         |             |              |          |                |
| H3-005 | Skip onboarding option tersedia            | Onboarding       |             |              |          |                |
| H3-006 | Close modal dengan klik outside/X/Escape   | Global           |             |              |          |                |
| H3-007 | Clear/reset search dan filter              | Drill, Roleplay  |             |              |          |                |
| H3-008 | Reset form ke default values               | Global           |             |              |          |                |
| H3-009 | Pause/resume study session                 | Drill            |             |              |          |                |
| H3-010 | Cancel voice recording sebelum send        | Kaiwa            |             |              |          |                |
| H3-011 | Edit/delete message sebelum AI response    | Chat             |             |              |          |                |
| H3-012 | Cancel subscription dengan mudah           | Subscription     |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H4. Consistency and Standards

_Apakah elemen yang sama berperilaku sama di seluruh aplikasi?_

| ID     | Checkpoint                                           | Area   | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ---------------------------------------------------- | ------ | ----------- | ------------ | -------- | -------------- |
| H4-001 | Button style konsisten (primary, secondary, ghost)   | Global |             |              |          |                |
| H4-002 | Color coding konsisten (success=green, error=red)    | Global |             |              |          |                |
| H4-003 | Typography hierarchy konsisten (h1, h2, body)        | Global |             |              |          |                |
| H4-004 | Spacing dan padding konsisten (8px grid)             | Global |             |              |          |                |
| H4-005 | Icon style konsisten (outline vs filled)             | Global |             |              |          |                |
| H4-006 | Card design konsisten (shadow, radius, padding)      | Global |             |              |          |                |
| H4-007 | Form input style konsisten (border, focus state)     | Global |             |              |          |                |
| H4-008 | Navigation pattern konsisten                         | Global |             |              |          |                |
| H4-009 | Modal/dialog style konsisten                         | Global |             |              |          |                |
| H4-010 | Empty state design konsisten                         | Global |             |              |          |                |
| H4-011 | Loading state design konsisten (skeleton vs spinner) | Global |             |              |          |                |
| H4-012 | Toast/notification style konsisten                   | Global |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H5. Error Prevention

_Apakah sistem mencegah error sebelum terjadi?_

| ID     | Checkpoint                                   | Area         | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | -------------------------------------------- | ------------ | ----------- | ------------ | -------- | -------------- |
| H5-001 | Konfirmasi dialog sebelum delete             | Global       |             |              |          |                |
| H5-002 | Validasi input real-time (saat typing)       | Forms        |             |              |          |                |
| H5-003 | Disable submit button saat form invalid      | Forms        |             |              |          |                |
| H5-004 | Warning sebelum leave dengan unsaved changes | Forms        |             |              |          |                |
| H5-005 | Credit check sebelum start session           | Kaiwa        |             |              |          |                |
| H5-006 | Prevent double submit (disable after click)  | Forms        |             |              |          |                |
| H5-007 | Character limit indicator dengan countdown   | Chat, Forms  |             |              |          |                |
| H5-008 | File type dan size validation saat upload    | Upload       |             |              |          |                |
| H5-009 | Password strength indicator                  | Auth         |             |              |          |                |
| H5-010 | Konfirmasi sebelum cancel subscription       | Subscription |             |              |          |                |
| H5-011 | Validate voucher format before submit        | Voucher      |             |              |          |                |
| H5-012 | Prevent empty deck creation (min 1 card)     | Drill        |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H6. Recognition Rather Than Recall

_Apakah user tidak perlu mengingat informasi dari satu bagian ke bagian lain?_

| ID     | Checkpoint                                  | Area       | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ------------------------------------------- | ---------- | ----------- | ------------ | -------- | -------------- |
| H6-001 | Recent activity/history tersedia            | Dashboard  |             |              |          |                |
| H6-002 | Search suggestions/autocomplete             | Search     |             |              |          |                |
| H6-003 | Breadcrumb navigation                       | Global     |             |              |          |                |
| H6-004 | Current location indicator di navigation    | Navigation |             |              |          |                |
| H6-005 | Previously selected options visible         | Forms      |             |              |          |                |
| H6-006 | Character preview saat select               | Free Chat  |             |              |          |                |
| H6-007 | Task preview sebelum start                  | Roleplay   |             |              |          |                |
| H6-008 | Deck preview sebelum study                  | Drill      |             |              |          |                |
| H6-009 | Tooltips untuk icon dan actions             | Global     |             |              |          |                |
| H6-010 | Placeholder text yang helpful dan contoh    | Forms      |             |              |          |                |
| H6-011 | Recently used decks/characters di dashboard | Dashboard  |             |              |          |                |
| H6-012 | Saved preferences visible dan editable      | Settings   |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H7. Flexibility and Efficiency of Use

_Apakah ada shortcuts dan cara cepat untuk expert users?_

| ID     | Checkpoint                                 | Area            | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ------------------------------------------ | --------------- | ----------- | ------------ | -------- | -------------- |
| H7-001 | Keyboard shortcuts tersedia dan documented | Global          |             |              |          |                |
| H7-002 | Quick actions dari dashboard               | Dashboard       |             |              |          |                |
| H7-003 | Swipe gestures di mobile                   | Mobile          |             |              |          |                |
| H7-004 | Bulk actions (multi-select delete/edit)    | Drill           |             |              |          |                |
| H7-005 | Quick create character shortcut            | Free Chat       |             |              |          |                |
| H7-006 | Quick start session dari dashboard         | Dashboard       |             |              |          |                |
| H7-007 | Favorites/bookmarks untuk quick access     | Drill, Roleplay |             |              |          |                |
| H7-008 | Filter dan sort yang powerful              | Lists           |             |              |          |                |
| H7-009 | Voice input sebagai alternatif typing      | Kaiwa           |             |              |          |                |
| H7-010 | Auto-save draft saat typing                | Forms           |             |              |          |                |
| H7-011 | Remember last used settings                | Global          |             |              |          |                |
| H7-012 | Skip intro/tutorial untuk returning users  | Onboarding      |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H8. Aesthetic and Minimalist Design

_Apakah interface bersih dan tidak mengandung informasi yang tidak relevan?_

| ID     | Checkpoint                                            | Area      | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ----------------------------------------------------- | --------- | ----------- | ------------ | -------- | -------------- |
| H8-001 | Visual hierarchy jelas (important things stand out)   | Global    |             |              |          |                |
| H8-002 | White space cukup, tidak cluttered                    | Global    |             |              |          |                |
| H8-003 | Tidak ada elemen dekoratif yang tidak perlu           | Global    |             |              |          |                |
| H8-004 | Content prioritization tepat (important first)        | Dashboard |             |              |          |                |
| H8-005 | Progressive disclosure (show more/expand)             | Lists     |             |              |          |                |
| H8-006 | Clean form layout (tidak overwhelming)                | Forms     |             |              |          |                |
| H8-007 | Readable font size (min 14px body)                    | Global    |             |              |          |                |
| H8-008 | Appropriate color contrast (WCAG AA)                  | Global    |             |              |          |                |
| H8-009 | Image quality dan optimization (tidak blur/pixelated) | Global    |             |              |          |                |
| H8-010 | Focused chat interface (no distractions)              | Kaiwa     |             |              |          |                |
| H8-011 | Distraction-free study mode                           | Drill     |             |              |          |                |
| H8-012 | Mobile-optimized layout (tidak cramped)               | Mobile    |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H9. Help Users Recognize, Diagnose, and Recover from Errors

_Apakah error messages jelas dan memberikan solusi?_

| ID     | Checkpoint                                            | Area         | Score (1-5) | Issues Found | Severity | Recommendation |
| ------ | ----------------------------------------------------- | ------------ | ----------- | ------------ | -------- | -------------- |
| H9-001 | Error message dalam bahasa manusia (bukan technical)  | Global       |             |              |          |                |
| H9-002 | Error message spesifik (bukan "Something went wrong") | Global       |             |              |          |                |
| H9-003 | Solusi atau next step disertakan dalam error          | Global       |             |              |          |                |
| H9-004 | Visual indicator jelas untuk field error              | Forms        |             |              |          |                |
| H9-005 | Network error dengan retry button                     | Global       |             |              |          |                |
| H9-006 | Payment error dengan alternative action               | Payment      |             |              |          |                |
| H9-007 | Voice input error handling yang jelas                 | Kaiwa        |             |              |          |                |
| H9-008 | Session timeout dengan auto-save option               | Kaiwa        |             |              |          |                |
| H9-009 | Invalid voucher dengan explanation yang jelas         | Voucher      |             |              |          |                |
| H9-010 | Credit insufficient dengan upgrade CTA                | Subscription |             |              |          |                |
| H9-011 | 404 page dengan helpful navigation                    | Global       |             |              |          |                |
| H9-012 | API error dengan contact support option               | Global       |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### H10. Help and Documentation

_Apakah help dan dokumentasi tersedia saat dibutuhkan?_

| ID      | Checkpoint                                | Area         | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | ----------------------------------------- | ------------ | ----------- | ------------ | -------- | -------------- |
| H10-001 | Onboarding tutorial tersedia              | Onboarding   |             |              |          |                |
| H10-002 | Feature tour/walkthrough untuk fitur baru | Global       |             |              |          |                |
| H10-003 | Tooltips untuk fitur kompleks             | Global       |             |              |          |                |
| H10-004 | FAQ accessible dari app                   | Landing, App |             |              |          |                |
| H10-005 | Contact support accessible                | Global       |             |              |          |                |
| H10-006 | Help center/knowledge base                | Global       |             |              |          |                |
| H10-007 | Contextual help dalam feature             | Features     |             |              |          |                |
| H10-008 | Video tutorials (jika ada)                | Help         |             |              |          |                |
| H10-009 | In-app chat support atau chatbot          | Global       |             |              |          |                |
| H10-010 | Searchable help content                   | Help         |             |              |          |                |
| H10-011 | Getting started guide untuk new users     | Dashboard    |             |              |          |                |
| H10-012 | Feature explanation popup saat first use  | New Features |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

## BAGIAN 2: SPECIFIC UX AREAS

### 2.1 First Impression & Onboarding

| ID      | Checkpoint                            | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | ------------------------------------- | ----------- | ------------ | -------- | -------------- |
| ONB-001 | Value proposition jelas dalam 5 detik |             |              |          |                |
| ONB-002 | CTA utama mudah ditemukan             |             |              |          |                |
| ONB-003 | Sign up flow simple (< 3 steps)       |             |              |          |                |
| ONB-004 | Onboarding progress indicator jelas   |             |              |          |                |
| ONB-005 | Questions relevant dan tidak invasive |             |              |          |                |
| ONB-006 | Time to first value (< 5 menit)       |             |              |          |                |
| ONB-007 | Skip option tanpa penalty             |             |              |          |                |
| ONB-008 | Personalization terasa meaningful     |             |              |          |                |
| ONB-009 | Welcome message warm dan personal     |             |              |          |                |
| ONB-010 | Empty state guidance actionable       |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.2 Navigation & Information Architecture

| ID      | Checkpoint                             | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | -------------------------------------- | ----------- | ------------ | -------- | -------------- |
| NAV-001 | Menu structure logical dan predictable |             |              |          |                |
| NAV-002 | Navigation depth max 3 levels          |             |              |          |                |
| NAV-003 | Current location always visible        |             |              |          |                |
| NAV-004 | Back navigation predictable            |             |              |          |                |
| NAV-005 | Search functionality adequate          |             |              |          |                |
| NAV-006 | Mobile bottom nav thumb-friendly       |             |              |          |                |
| NAV-007 | Sidebar organization logical           |             |              |          |                |
| NAV-008 | Tab organization dalam pages clear     |             |              |          |                |
| NAV-009 | Deep link support berfungsi            |             |              |          |                |
| NAV-010 | Cross-navigation antar features smooth |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.3 Forms & Input Experience

| ID       | Checkpoint                                  | Score (1-5) | Issues Found | Severity | Recommendation |
| -------- | ------------------------------------------- | ----------- | ------------ | -------- | -------------- |
| FORM-001 | Label jelas dan di atas input               |             |              |          |                |
| FORM-002 | Required fields ditandai dengan jelas       |             |              |          |                |
| FORM-003 | Input type sesuai (email, number, tel)      |             |              |          |                |
| FORM-004 | Placeholder text helpful bukan label        |             |              |          |                |
| FORM-005 | Validation timing tepat (blur, not type)    |             |              |          |                |
| FORM-006 | Error message di bawah field yang error     |             |              |          |                |
| FORM-007 | Success state dan feedback jelas            |             |              |          |                |
| FORM-008 | Form length reasonable (tidak overwhelming) |             |              |          |                |
| FORM-009 | Mobile keyboard type sesuai                 |             |              |          |                |
| FORM-010 | Auto-focus pada first field                 |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.4 Chat/Conversation UX

| ID       | Checkpoint                                 | Score (1-5) | Issues Found | Severity | Recommendation |
| -------- | ------------------------------------------ | ----------- | ------------ | -------- | -------------- |
| CHAT-001 | Message bubble differentiation jelas       |             |              |          |                |
| CHAT-002 | Sender identification (avatar, name) jelas |             |              |          |                |
| CHAT-003 | Timestamp visibility appropriate           |             |              |          |                |
| CHAT-004 | Input area always visible dan accessible   |             |              |          |                |
| CHAT-005 | Voice input button prominent               |             |              |          |                |
| CHAT-006 | Send button responsive dan jelas           |             |              |          |                |
| CHAT-007 | Auto-scroll ke new message natural         |             |              |          |                |
| CHAT-008 | Long message handling (expand/collapse)    |             |              |          |                |
| CHAT-009 | Japanese text sizing dan readability       |             |              |          |                |
| CHAT-010 | Audio playback controls accessible         |             |              |          |                |
| CHAT-011 | Hint button discoverable                   |             |              |          |                |
| CHAT-012 | AI response streaming smooth               |             |              |          |                |

**Section Score**: \_\_\_ / 60

---

### 2.5 Flashcard/Drill UX

| ID        | Checkpoint                                | Score (1-5) | Issues Found | Severity | Recommendation |
| --------- | ----------------------------------------- | ----------- | ------------ | -------- | -------------- |
| DRILL-001 | Card flip animation smooth dan satisfying |             |              |          |                |
| DRILL-002 | Answer reveal intuitive (tap/click)       |             |              |          |                |
| DRILL-003 | Rating buttons accessible dan jelas       |             |              |          |                |
| DRILL-004 | Session progress visible                  |             |              |          |                |
| DRILL-005 | Session completion celebratory            |             |              |          |                |
| DRILL-006 | Stats visualization understandable        |             |              |          |                |
| DRILL-007 | Card creation flow simple                 |             |              |          |                |
| DRILL-008 | Deck organization logical                 |             |              |          |                |
| DRILL-009 | Due cards indication clear                |             |              |          |                |
| DRILL-010 | Mobile gesture support (swipe)            |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.6 Payment & Subscription UX

| ID      | Checkpoint                           | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | ------------------------------------ | ----------- | ------------ | -------- | -------------- |
| PAY-001 | Pricing tiers clearly differentiated |             |              |          |                |
| PAY-002 | Feature comparison easy to scan      |             |              |          |                |
| PAY-003 | Checkout flow minimal steps          |             |              |          |                |
| PAY-004 | Payment methods clearly displayed    |             |              |          |                |
| PAY-005 | Security indicators visible          |             |              |          |                |
| PAY-006 | Order summary clear before confirm   |             |              |          |                |
| PAY-007 | Discount/promo application visible   |             |              |          |                |
| PAY-008 | Payment confirmation satisfying      |             |              |          |                |
| PAY-009 | Receipt/invoice accessible           |             |              |          |                |
| PAY-010 | Subscription management easy         |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.7 Mobile Experience

| ID      | Checkpoint                             | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | -------------------------------------- | ----------- | ------------ | -------- | -------------- |
| MOB-001 | Touch targets min 44x44px              |             |              |          |                |
| MOB-002 | Thumb-zone navigation                  |             |              |          |                |
| MOB-003 | Landscape orientation handled          |             |              |          |                |
| MOB-004 | Pull-to-refresh where appropriate      |             |              |          |                |
| MOB-005 | Swipe gestures intuitive               |             |              |          |                |
| MOB-006 | Keyboard tidak block important content |             |              |          |                |
| MOB-007 | Bottom sheet usage appropriate         |             |              |          |                |
| MOB-008 | Modal sizing appropriate               |             |              |          |                |
| MOB-009 | Font size readable tanpa zoom          |             |              |          |                |
| MOB-010 | Offline state handling                 |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.8 Accessibility (A11y)

| ID       | Checkpoint                             | Score (1-5) | Issues Found | Severity | Recommendation |
| -------- | -------------------------------------- | ----------- | ------------ | -------- | -------------- |
| A11Y-001 | Color contrast ratio min 4.5:1         |             |              |          |                |
| A11Y-002 | Focus indicator visible                |             |              |          |                |
| A11Y-003 | Keyboard navigation possible           |             |              |          |                |
| A11Y-004 | Screen reader compatibility            |             |              |          |                |
| A11Y-005 | Alt text untuk images                  |             |              |          |                |
| A11Y-006 | ARIA labels pada interactive elements  |             |              |          |                |
| A11Y-007 | Form label associations proper         |             |              |          |                |
| A11Y-008 | Error announcement untuk screen reader |             |              |          |                |
| A11Y-009 | Skip navigation link tersedia          |             |              |          |                |
| A11Y-010 | Text resize hingga 200% tanpa break    |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.9 Performance Perception

| ID       | Checkpoint                          | Score (1-5) | Issues Found | Severity | Recommendation |
| -------- | ----------------------------------- | ----------- | ------------ | -------- | -------------- |
| PERF-001 | Initial page load < 3 detik         |             |              |          |                |
| PERF-002 | Navigation transitions smooth       |             |              |          |                |
| PERF-003 | Image loading optimized (lazy load) |             |              |          |                |
| PERF-004 | Skeleton loading saat fetch         |             |              |          |                |
| PERF-005 | Infinite scroll smooth              |             |              |          |                |
| PERF-006 | Animation performance 60fps         |             |              |          |                |
| PERF-007 | Form submission responsive          |             |              |          |                |
| PERF-008 | Search response < 1 detik           |             |              |          |                |
| PERF-009 | Chat message delivery instant feel  |             |              |          |                |
| PERF-010 | Audio playback start < 500ms        |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

### 2.10 Emotional Design & Delight

| ID      | Checkpoint                        | Score (1-5) | Issues Found | Severity | Recommendation |
| ------- | --------------------------------- | ----------- | ------------ | -------- | -------------- |
| EMO-001 | Visual appeal keseluruhan menarik |             |              |          |                |
| EMO-002 | Brand personality consistent      |             |              |          |                |
| EMO-003 | Micro-interactions delightful     |             |              |          |                |
| EMO-004 | Achievement celebration rewarding |             |              |          |                |
| EMO-005 | Progress visualization motivating |             |              |          |                |
| EMO-006 | Empty state friendly bukan cold   |             |              |          |                |
| EMO-007 | Error state empathetic            |             |              |          |                |
| EMO-008 | Personalization terasa genuine    |             |              |          |                |
| EMO-009 | Character personality engaging    |             |              |          |                |
| EMO-010 | Gamification elements motivating  |             |              |          |                |

**Section Score**: \_\_\_ / 50

---

## BAGIAN 3: TASK-BASED USABILITY TEST

### Test Scenarios

Observasi user melakukan task berikut dan catat:

| Task ID | Task Description                           | Target Time | Success Rate | Actual Time | Errors | Difficulty (1-5) | User Verbatim |
| ------- | ------------------------------------------ | ----------- | ------------ | ----------- | ------ | ---------------- | ------------- |
| T-001   | Daftar akun baru dan selesaikan onboarding | 3 min       |              |             |        |                  |               |
| T-002   | Temukan dan mulai roleplay level N5        | 2 min       |              |             |        |                  |               |
| T-003   | Kirim pesan suara dalam roleplay           | 1 min       |              |             |        |                  |               |
| T-004   | Selesaikan roleplay dan lihat hasil        | 10 min      |              |             |        |                  |               |
| T-005   | Buat character custom untuk free chat      | 3 min       |              |             |        |                  |               |
| T-006   | Mulai free chat dengan character           | 1 min       |              |             |        |                  |               |
| T-007   | Buat deck flashcard baru dengan 5 cards    | 5 min       |              |             |        |                  |               |
| T-008   | Selesaikan sesi study 10 flashcards        | 5 min       |              |             |        |                  |               |
| T-009   | Temukan dan favorite sebuah public deck    | 2 min       |              |             |        |                  |               |
| T-010   | Share deck ke teman via link               | 1 min       |              |             |        |                  |               |
| T-011   | Upgrade ke paket Basic                     | 3 min       |              |             |        |                  |               |
| T-012   | Redeem voucher code                        | 1 min       |              |             |        |                  |               |
| T-013   | Ubah profil dan upload avatar              | 2 min       |              |             |        |                  |               |
| T-014   | Ganti tema ke dark mode                    | 30 sec      |              |             |        |                  |               |
| T-015   | Cancel subscription                        | 2 min       |              |             |        |                  |               |

### Task Success Metrics

| Metric                  | Target | Actual | Status |
| ----------------------- | ------ | ------ | ------ |
| Overall Success Rate    | > 85%  |        |        |
| Average Task Difficulty | < 2.5  |        |        |
| Critical Errors         | 0      |        |        |
| Average Time Efficiency | 100%   |        |        |

---

## BAGIAN 4: POST-TEST QUESTIONNAIRE

### System Usability Scale (SUS)

Instruksi: Beri nilai 1 (Sangat Tidak Setuju) sampai 5 (Sangat Setuju)

| No  | Statement                                                           | Score (1-5) |
| --- | ------------------------------------------------------------------- | ----------- |
| 1   | Saya akan sering menggunakan aplikasi ini                           |             |
| 2   | Saya merasa aplikasi ini terlalu kompleks                           |             |
| 3   | Saya merasa aplikasi ini mudah digunakan                            |             |
| 4   | Saya butuh bantuan teknis untuk menggunakan aplikasi ini            |             |
| 5   | Saya merasa fitur-fitur terintegrasi dengan baik                    |             |
| 6   | Saya merasa ada terlalu banyak inkonsistensi                        |             |
| 7   | Kebanyakan orang akan cepat belajar menggunakan aplikasi ini        |             |
| 8   | Saya merasa aplikasi ini sangat rumit digunakan                     |             |
| 9   | Saya merasa percaya diri menggunakan aplikasi ini                   |             |
| 10  | Saya perlu belajar banyak hal sebelum bisa menggunakan aplikasi ini |             |

**Calculation**: ((Sum of odd - 5) + (25 - Sum of even)) × 2.5 = **SUS Score: \_\_\_ / 100**

| Score Range | Grade | Interpretation                       |
| ----------- | ----- | ------------------------------------ |
| 90-100      | A+    | Exceptional - Best in class          |
| 80-89       | A     | Excellent - Users love it            |
| 70-79       | B     | Good - Minor improvements needed     |
| 60-69       | C     | OK - Significant improvements needed |
| 50-59       | D     | Poor - Major redesign needed         |
| < 50        | F     | Unacceptable - Complete redesign     |

### Open-Ended Questions

| Question                                                                        | User Response |
| ------------------------------------------------------------------------------- | ------------- |
| Apa kesan pertama Anda tentang aplikasi ini?                                    |               |
| Fitur mana yang paling Anda sukai? Mengapa?                                     |               |
| Fitur mana yang paling membingungkan? Mengapa?                                  |               |
| Apa satu hal yang paling ingin Anda ubah?                                       |               |
| Apakah Anda akan merekomendasikan app ini ke teman? (1-10) Mengapa?             |               |
| Bagaimana perbandingan dengan app belajar bahasa lain yang pernah Anda gunakan? |               |
| Apakah harga sesuai dengan value yang didapat?                                  |               |
| Ada saran lain untuk perbaikan?                                                 |               |

---

## BAGIAN 5: SUMMARY & PRIORITIZATION

### Heuristic Scores Summary

| Heuristic                       | Score | Max     | %     | Priority Issues |
| ------------------------------- | ----- | ------- | ----- | --------------- |
| H1. Visibility of System Status |       | 60      |       |                 |
| H2. Match with Real World       |       | 50      |       |                 |
| H3. User Control & Freedom      |       | 60      |       |                 |
| H4. Consistency & Standards     |       | 60      |       |                 |
| H5. Error Prevention            |       | 60      |       |                 |
| H6. Recognition vs Recall       |       | 60      |       |                 |
| H7. Flexibility & Efficiency    |       | 60      |       |                 |
| H8. Aesthetic & Minimalist      |       | 60      |       |                 |
| H9. Error Recovery              |       | 60      |       |                 |
| H10. Help & Documentation       |       | 60      |       |                 |
| **TOTAL HEURISTIC**             |       | **590** | **%** |                 |

### Specific Areas Summary

| Area                   | Score | Max     | %     | Priority Issues |
| ---------------------- | ----- | ------- | ----- | --------------- |
| Onboarding             |       | 50      |       |                 |
| Navigation & IA        |       | 50      |       |                 |
| Forms & Input          |       | 50      |       |                 |
| Chat/Conversation      |       | 60      |       |                 |
| Flashcard/Drill        |       | 50      |       |                 |
| Payment & Subscription |       | 50      |       |                 |
| Mobile Experience      |       | 50      |       |                 |
| Accessibility          |       | 50      |       |                 |
| Performance            |       | 50      |       |                 |
| Emotional Design       |       | 50      |       |                 |
| **TOTAL SPECIFIC**     |       | **510** | **%** |                 |

### Overall Score

| Category           | Score | Max  | %     |
| ------------------ | ----- | ---- | ----- |
| Heuristics         |       | 590  |       |
| Specific Areas     |       | 510  |       |
| SUS Score          |       | 100  |       |
| Task Success Rate  |       | 100% |       |
| **WEIGHTED TOTAL** |       |      | **%** |

---

## BAGIAN 6: ISSUE PRIORITIZATION MATRIX

### All Issues Found

| Rank | ID  | Issue Description | Area | Severity | Impact | Effort | Priority Score | Recommendation |
| ---- | --- | ----------------- | ---- | -------- | ------ | ------ | -------------- | -------------- |
| 1    |     |                   |      |          |        |        |                |                |
| 2    |     |                   |      |          |        |        |                |                |
| 3    |     |                   |      |          |        |        |                |                |
| 4    |     |                   |      |          |        |        |                |                |
| 5    |     |                   |      |          |        |        |                |                |
| 6    |     |                   |      |          |        |        |                |                |
| 7    |     |                   |      |          |        |        |                |                |
| 8    |     |                   |      |          |        |        |                |                |
| 9    |     |                   |      |          |        |        |                |                |
| 10   |     |                   |      |          |        |        |                |                |

_Priority Score = Severity × Impact - Effort (Higher = Fix First)_

### Quick Wins (Low Effort, High Impact)

| Issue | Effort (1-5) | Impact (1-5) | Recommendation | Owner | ETA |
| ----- | ------------ | ------------ | -------------- | ----- | --- |
|       |              |              |                |       |     |
|       |              |              |                |       |     |
|       |              |              |                |       |     |

### Strategic Improvements (High Effort, High Impact)

| Issue | Effort (1-5) | Impact (1-5) | Recommendation | Owner | ETA |
| ----- | ------------ | ------------ | -------------- | ----- | --- |
|       |              |              |                |       |     |
|       |              |              |                |       |     |
|       |              |              |                |       |     |

### Low Priority (Low Impact)

| Issue | Effort (1-5) | Impact (1-5) | Recommendation | Notes |
| ----- | ------------ | ------------ | -------------- | ----- |
|       |              |              |                |       |
|       |              |              |                |       |

---

## Test Session Information

| Field             | Value                                 |
| ----------------- | ------------------------------------- |
| Evaluator Name    |                                       |
| Test Date         |                                       |
| Test Duration     |                                       |
| Device Used       |                                       |
| Browser/OS        |                                       |
| Screen Size       |                                       |
| Network Condition |                                       |
| User Profile      | New User / Existing User / Power User |
| JLPT Level        |                                       |
| Age Range         |                                       |
| Tech Savviness    | Low / Medium / High                   |
| Notes             |                                       |

---

## Appendix: Screenshot Evidence

| Issue ID | Screenshot File | Description |
| -------- | --------------- | ----------- |
|          |                 |             |
|          |                 |             |
|          |                 |             |

---

## Revision History

| Version | Date       | Author | Changes                                           |
| ------- | ---------- | ------ | ------------------------------------------------- |
| 1.0     | 2024-11-29 |        | Initial version                                   |
| 2.0     | 2024-11-29 |        | Added Nielsen heuristics, SUS, task-based testing |

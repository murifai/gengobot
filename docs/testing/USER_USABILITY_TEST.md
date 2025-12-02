# Gengobot - User Usability Test Tasks

> **Version**: 1.0
> **Last Updated**: 2024-11-29
> **Total Tasks**: 70 tasks

---

## Overview

Dokumen ini berisi daftar lengkap usability test tasks untuk fitur-fitur user-facing di Gengobot. Tasks diorganisir berdasarkan prioritas dan modul fitur.

---

## 🔴 PRIORITAS TINGGI (Critical User Flows)

### 1. Authentication & Onboarding

| ID       | Task                                       | Precondition                | Expected Result                                  |
| -------- | ------------------------------------------ | --------------------------- | ------------------------------------------------ |
| AUTH-001 | Login dengan email valid                   | User sudah terdaftar        | Redirect ke dashboard, session active            |
| AUTH-002 | Login dengan email invalid                 | -                           | Error message "Email tidak ditemukan"            |
| AUTH-003 | Login dengan password salah                | User sudah terdaftar        | Error message "Password salah"                   |
| AUTH-004 | Logout dari aplikasi                       | User sudah login            | Redirect ke landing page, session cleared        |
| AUTH-005 | Complete onboarding - Pilih usia           | User baru, belum onboarding | Selection tersimpan, next step                   |
| AUTH-006 | Complete onboarding - Pilih gender         | Step usia selesai           | Selection tersimpan, next step                   |
| AUTH-007 | Complete onboarding - Pilih level JLPT     | Step gender selesai         | Selection tersimpan, next step                   |
| AUTH-008 | Complete onboarding - Pilih learning goals | Step level selesai          | Selection tersimpan, next step                   |
| AUTH-009 | Complete onboarding - Submit               | Semua step selesai          | Redirect ke dashboard, onboarding complete       |
| AUTH-010 | Back navigation di onboarding              | Di step 2+                  | Kembali ke step sebelumnya tanpa kehilangan data |

---

### 2. Kaiwa - Roleplay (Task-Based Learning)

| ID     | Task                               | Precondition                  | Expected Result                          |
| ------ | ---------------------------------- | ----------------------------- | ---------------------------------------- |
| RP-001 | Browse roleplay tasks              | User login                    | List tasks tampil dengan thumbnail       |
| RP-002 | Filter tasks by category           | Di halaman roleplay           | Tasks filtered sesuai kategori           |
| RP-003 | Filter tasks by JLPT level         | Di halaman roleplay           | Tasks filtered sesuai level (N5-N1)      |
| RP-004 | Search tasks by keyword            | Di halaman roleplay           | Search results relevan                   |
| RP-005 | View task detail                   | Task dipilih                  | Detail, objectives, dan pre-study tampil |
| RP-006 | View pre-task study materials      | Di task detail                | Vocabulary dan dialog contoh tampil      |
| RP-007 | Start new roleplay attempt         | Credits tersedia              | Chat session dimulai, AI greeting muncul |
| RP-008 | Send text message                  | Dalam roleplay session        | Message terkirim, AI response streaming  |
| RP-009 | Use voice input - Start recording  | Dalam roleplay session        | Recording indicator aktif                |
| RP-010 | Use voice input - Stop & send      | Sedang recording              | Audio transcribed, message terkirim      |
| RP-011 | Play AI voice response             | AI sudah merespon             | Audio TTS terdengar jelas                |
| RP-012 | Request hint                       | Dalam roleplay session        | Hint relevan ditampilkan                 |
| RP-013 | View learning objectives progress  | Dalam roleplay session        | Progress bar/checklist tampil            |
| RP-014 | Complete learning objective        | Objective tercapai dalam chat | Objective marked as completed            |
| RP-015 | Receive task completion suggestion | Semua objectives selesai      | Completion dialog muncul                 |
| RP-016 | Complete/finish roleplay           | Di completion dialog          | Post-task review tampil                  |
| RP-017 | View post-task assessment          | Task selesai                  | Score dan feedback tampil                |
| RP-018 | Retry roleplay task                | Task gagal/selesai            | New attempt dimulai                      |
| RP-019 | Resume incomplete roleplay         | Ada attempt belum selesai     | Resume dialog muncul, bisa lanjut        |
| RP-020 | View message limit warning         | Mendekati limit               | Warning tampil dengan sisa messages      |

---

### 3. Kaiwa - Ngobrol Bebas (Free Chat)

| ID     | Task                             | Precondition            | Expected Result                         |
| ------ | -------------------------------- | ----------------------- | --------------------------------------- |
| FC-001 | View available characters        | User login              | Character cards tampil                  |
| FC-002 | Select character untuk chat      | Characters tersedia     | Chat interface terbuka                  |
| FC-003 | View character info              | Character selected      | Name, personality, relationship tampil  |
| FC-004 | Send text message                | Dalam chat session      | Message terkirim, AI streaming response |
| FC-005 | Use voice input                  | Dalam chat session      | Recording → Transcription → Send        |
| FC-006 | Play AI TTS response             | AI sudah merespon       | Audio terdengar dengan voice character  |
| FC-007 | Adjust voice speed               | Dalam settings          | Speed berubah (0.5x - 2x)               |
| FC-008 | Request hint                     | Dalam chat session      | Hint suggestion tampil                  |
| FC-009 | View chat history                | Character punya history | Previous messages load                  |
| FC-010 | Start new conversation           | Ada chat sebelumnya     | New session, history tersimpan          |
| FC-011 | Click Japanese text untuk lookup | Ada text Jepang         | Vocabulary popup muncul                 |
| FC-012 | Add word to deck dari popup      | Popup terbuka           | Word added ke selected deck             |

---

### 4. Subscription & Payment

| ID      | Task                              | Precondition             | Expected Result                       |
| ------- | --------------------------------- | ------------------------ | ------------------------------------- |
| SUB-001 | View subscription status          | User login               | Current plan dan status tampil        |
| SUB-002 | View credit balance               | User login               | Total, used, remaining credits tampil |
| SUB-003 | View trial status                 | User dalam trial         | Trial days remaining tampil           |
| SUB-004 | View credit usage chart           | User punya usage history | Chart 30 hari tampil                  |
| SUB-005 | Navigate to upgrade page          | User Free/Basic          | Upgrade page terbuka                  |
| SUB-006 | Select subscription tier          | Di upgrade page          | Tier selected, price updated          |
| SUB-007 | Select subscription duration      | Tier selected            | Duration selected, discount applied   |
| SUB-008 | View checkout summary             | Tier & duration selected | Total price dengan discount tampil    |
| SUB-009 | Initiate payment                  | Checkout ready           | Midtrans payment page terbuka         |
| SUB-010 | Complete payment                  | Di Midtrans              | Payment success, redirect ke app      |
| SUB-011 | View payment success confirmation | Payment berhasil         | Success message, new plan active      |
| SUB-012 | Handle payment failure            | Payment gagal            | Error message, retry option           |
| SUB-013 | View payment history              | User punya payments      | Payment list dengan details           |
| SUB-014 | Input voucher code                | Di subscription page     | Input field aktif                     |
| SUB-015 | Redeem valid voucher              | Voucher code valid       | Credits/discount applied              |
| SUB-016 | Redeem invalid voucher            | Voucher code invalid     | Error message tampil                  |
| SUB-017 | Cancel subscription               | User subscribed          | Confirmation dialog, cancel success   |
| SUB-018 | Reactivate subscription           | Subscription cancelled   | Reactivation success                  |
| SUB-019 | View low credit warning           | Credits < 10%            | Warning banner tampil                 |
| SUB-020 | View usage history                | User punya transactions  | Transaction list tampil               |

---

## 🟠 PRIORITAS MENENGAH (Important Features)

### 5. Drill - Flashcard System

| ID     | Task                          | Precondition        | Expected Result                        |
| ------ | ----------------------------- | ------------------- | -------------------------------------- |
| DR-001 | Browse public decks           | User login          | Deck cards tampil dengan info          |
| DR-002 | Search decks by name          | Di drill page       | Search results relevan                 |
| DR-003 | Filter decks by category      | Di drill page       | Decks filtered                         |
| DR-004 | View deck detail              | Deck selected       | Cards count, description tampil        |
| DR-005 | View deck cards preview       | Di deck detail      | Card list tampil                       |
| DR-006 | Start study session           | Deck dengan cards   | SRS session dimulai                    |
| DR-007 | View flashcard question       | Dalam study session | Question/front tampil                  |
| DR-008 | Reveal flashcard answer       | Question tampil     | Answer/back revealed                   |
| DR-009 | Rate card - Again             | Answer revealed     | Card rescheduled (soon)                |
| DR-010 | Rate card - Hard              | Answer revealed     | Card rescheduled (medium)              |
| DR-011 | Rate card - Good              | Answer revealed     | Card rescheduled (normal)              |
| DR-012 | Rate card - Easy              | Answer revealed     | Card rescheduled (later)               |
| DR-013 | Complete study session        | All cards reviewed  | Session summary tampil                 |
| DR-014 | View deck statistics          | Deck dipilih        | Stats (mastered, learning, new) tampil |
| DR-015 | Create new deck               | User login          | Deck form terbuka                      |
| DR-016 | Input deck name & description | Di create form      | Fields saved                           |
| DR-017 | Add flashcard to deck         | Deck created        | Card added                             |
| DR-018 | Edit flashcard                | Card exists         | Card updated                           |
| DR-019 | Delete flashcard              | Card exists         | Card removed                           |
| DR-020 | Save/publish deck             | Cards added         | Deck saved, accessible                 |
| DR-021 | Edit deck info                | Deck owned          | Info updated                           |
| DR-022 | Delete deck                   | Deck owned          | Deck removed dengan konfirmasi         |
| DR-023 | Favorite deck                 | Deck exists         | Added to favorites                     |
| DR-024 | Unfavorite deck               | Deck favorited      | Removed from favorites                 |
| DR-025 | Duplicate deck                | Deck exists         | Copy created di My Decks               |
| DR-026 | Generate share link           | Deck owned          | Share URL generated                    |
| DR-027 | Access shared deck            | Valid share link    | Deck viewable                          |
| DR-028 | Import shared deck            | Di shared deck page | Deck copied ke My Decks                |

---

### 6. Character Management

| ID       | Task                                | Precondition          | Expected Result                |
| -------- | ----------------------------------- | --------------------- | ------------------------------ |
| CHAR-001 | View all characters                 | User login            | Character list tampil          |
| CHAR-002 | View character detail               | Character exists      | Full info tampil               |
| CHAR-003 | Create new character - Basic info   | Di create page        | Name, personality saved        |
| CHAR-004 | Create new character - Avatar       | Di create page        | Avatar uploaded/selected       |
| CHAR-005 | Create new character - Voice        | Di create page        | Voice type selected            |
| CHAR-006 | Create new character - Relationship | Di create page        | Relationship type saved        |
| CHAR-007 | Create new character - Submit       | All fields filled     | Character created              |
| CHAR-008 | Quick create character              | Di free chat page     | Modal opens, character created |
| CHAR-009 | Edit character info                 | Character owned       | Info updated                   |
| CHAR-010 | Change character avatar             | Character owned       | Avatar updated                 |
| CHAR-011 | Delete character                    | Character owned       | Character removed              |
| CHAR-012 | Delete character with chat history  | Character punya chats | Character + history removed    |

---

### 7. Profile & Settings

| ID       | Task                      | Precondition       | Expected Result             |
| -------- | ------------------------- | ------------------ | --------------------------- |
| PROF-001 | View profile page         | User login         | Profile tabs tampil         |
| PROF-002 | View personal information | Di profile page    | Name, email, level tampil   |
| PROF-003 | Edit full name            | Di edit profile    | Name updated                |
| PROF-004 | Edit nickname             | Di edit profile    | Nickname updated            |
| PROF-005 | Change domicile/city      | Di edit profile    | City updated                |
| PROF-006 | Change proficiency level  | Di edit profile    | JLPT level updated          |
| PROF-007 | Upload profile avatar     | Di edit profile    | Avatar uploaded & displayed |
| PROF-008 | Crop avatar image         | Avatar selected    | Crop tool works             |
| PROF-009 | Toggle dark mode          | Di settings        | Theme changes immediately   |
| PROF-010 | Toggle light mode         | Di settings (dark) | Theme changes immediately   |
| PROF-011 | View learning progress    | Di progress tab    | Charts dan stats tampil     |
| PROF-012 | View activity history     | Di progress tab    | Activity timeline tampil    |

---

## 🟡 PRIORITAS RENDAH (Supporting Features)

### 8. Dashboard & Activity

| ID       | Task                       | Precondition           | Expected Result           |
| -------- | -------------------------- | ---------------------- | ------------------------- |
| DASH-001 | View dashboard             | User login             | Dashboard components load |
| DASH-002 | View weekly activity chart | Punya activity         | Bar chart 7 hari tampil   |
| DASH-003 | View roleplay minutes      | Punya roleplay history | Minutes counted correctly |
| DASH-004 | View free chat minutes     | Punya chat history     | Minutes counted correctly |
| DASH-005 | View cards learned         | Punya drill history    | Cards count correct       |
| DASH-006 | View recent activity feed  | Punya activities       | Activity items tampil     |
| DASH-007 | Click activity item        | Activity item exists   | Navigate ke related page  |

---

### 9. Navigation & UX

| ID      | Task                              | Precondition      | Expected Result          |
| ------- | --------------------------------- | ----------------- | ------------------------ |
| NAV-001 | Navigate via sidebar - Dashboard  | Desktop view      | Dashboard loads          |
| NAV-002 | Navigate via sidebar - Kaiwa      | Desktop view      | Kaiwa page loads         |
| NAV-003 | Navigate via sidebar - Drill      | Desktop view      | Drill page loads         |
| NAV-004 | Navigate via sidebar - Profile    | Desktop view      | Profile page loads       |
| NAV-005 | Navigate via bottom nav - Home    | Mobile view       | Dashboard loads          |
| NAV-006 | Navigate via bottom nav - Kaiwa   | Mobile view       | Kaiwa page loads         |
| NAV-007 | Navigate via bottom nav - Drill   | Mobile view       | Drill page loads         |
| NAV-008 | Navigate via bottom nav - Profile | Mobile view       | Profile page loads       |
| NAV-009 | Use breadcrumb navigation         | Dalam nested page | Previous page loads      |
| NAV-010 | View loading state                | Page loading      | Spinner/skeleton tampil  |
| NAV-011 | View error state                  | Error occurs      | Error message informatif |
| NAV-012 | View empty state                  | No data           | Empty state dengan CTA   |

---

### 10. Landing Page

| ID       | Task                    | Precondition        | Expected Result           |
| -------- | ----------------------- | ------------------- | ------------------------- |
| LAND-001 | View hero section       | Di landing page     | Hero content tampil       |
| LAND-002 | View features section   | Scroll down         | 6 features tampil         |
| LAND-003 | View pricing section    | Scroll down         | 3 tiers dengan comparison |
| LAND-004 | View FAQ section        | Scroll down         | FAQ accordion works       |
| LAND-005 | View testimonials       | Scroll down         | Testimonial cards tampil  |
| LAND-006 | Click CTA - Login       | Di landing          | Login page opens          |
| LAND-007 | Click CTA - Get Started | Di landing          | Signup/login flow starts  |
| LAND-008 | View footer links       | Scroll to bottom    | Links work correctly      |
| LAND-009 | View Terms of Service   | Footer link clicked | ToS page opens            |
| LAND-010 | View Privacy Policy     | Footer link clicked | Privacy page opens        |

---

## 📱 Device-Specific Tests

### Mobile (iOS & Android)

| ID      | Task                  | Device         | Expected Result                        |
| ------- | --------------------- | -------------- | -------------------------------------- |
| MOB-001 | Voice input recording | iOS Safari     | Microphone permission, recording works |
| MOB-002 | Voice input recording | Android Chrome | Microphone permission, recording works |
| MOB-003 | Audio playback TTS    | iOS Safari     | Audio plays without issues             |
| MOB-004 | Audio playback TTS    | Android Chrome | Audio plays without issues             |
| MOB-005 | Bottom navigation     | Mobile         | All tabs accessible                    |
| MOB-006 | Swipe gestures        | Mobile         | Smooth navigation                      |
| MOB-007 | Keyboard input        | Mobile         | Keyboard doesn't block input           |
| MOB-008 | Portrait orientation  | Mobile         | Layout responsive                      |
| MOB-009 | Landscape orientation | Mobile         | Layout adapts                          |

### Desktop

| ID       | Task               | Browser | Expected Result   |
| -------- | ------------------ | ------- | ----------------- |
| DESK-001 | Sidebar navigation | Chrome  | All links work    |
| DESK-002 | Sidebar collapse   | Chrome  | Sidebar toggles   |
| DESK-003 | Keyboard shortcuts | Chrome  | If any, they work |
| DESK-004 | Audio/video        | Safari  | WebRTC compatible |
| DESK-005 | Copy/paste in chat | All     | Works correctly   |

---

## Summary

| Priority    | Count         | Categories                              |
| ----------- | ------------- | --------------------------------------- |
| 🔴 Tinggi   | 42 tasks      | Auth, Roleplay, Free Chat, Subscription |
| 🟠 Menengah | 40 tasks      | Drill, Characters, Profile              |
| 🟡 Rendah   | 22 tasks      | Dashboard, Navigation, Landing          |
| 📱 Device   | 14 tasks      | Mobile & Desktop specific               |
| **Total**   | **118 tasks** |                                         |

---

## Test Schedule Recommendation

| Week   | Focus Area                   | Task IDs             |
| ------ | ---------------------------- | -------------------- |
| Week 1 | Auth & Onboarding            | AUTH-001 to AUTH-010 |
| Week 2 | Subscription & Payment       | SUB-001 to SUB-020   |
| Week 3 | Kaiwa Roleplay               | RP-001 to RP-020     |
| Week 4 | Kaiwa Free Chat              | FC-001 to FC-012     |
| Week 5 | Drill System                 | DR-001 to DR-028     |
| Week 6 | Character & Profile          | CHAR-001 to PROF-012 |
| Week 7 | Dashboard, Nav, Landing      | DASH, NAV, LAND      |
| Week 8 | Device-specific & Regression | MOB, DESK            |

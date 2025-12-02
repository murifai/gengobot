# Gengobot - Admin Usability Test Tasks

> **Version**: 1.0
> **Last Updated**: 2024-11-29
> **Total Tasks**: 65 tasks

---

## Overview

Dokumen ini berisi daftar lengkap usability test tasks untuk fitur-fitur admin panel di Gengobot. Tasks diorganisir berdasarkan prioritas dan modul fitur.

**Admin Panel URL**: `/admin`

---

## 🔴 PRIORITAS TINGGI (Critical Admin Flows)

### 1. Admin Authentication

| ID           | Task                             | Precondition         | Expected Result             |
| ------------ | -------------------------------- | -------------------- | --------------------------- |
| ADM-AUTH-001 | Login dengan email valid         | Admin account exists | Redirect ke admin dashboard |
| ADM-AUTH-002 | Login dengan email invalid       | -                    | Error message tampil        |
| ADM-AUTH-003 | Login dengan password salah      | Admin exists         | Error message tampil        |
| ADM-AUTH-004 | Logout dari admin panel          | Admin logged in      | Redirect ke admin login     |
| ADM-AUTH-005 | Forgot password - Request reset  | Admin email exists   | Reset email sent            |
| ADM-AUTH-006 | Forgot password - Reset password | Valid reset token    | Password updated            |
| ADM-AUTH-007 | Session timeout handling         | Session expired      | Redirect ke login           |

---

### 2. Admin Dashboard & Analytics

| ID           | Task                          | Precondition     | Expected Result           |
| ------------ | ----------------------------- | ---------------- | ------------------------- |
| ADM-DASH-001 | View admin dashboard          | Admin logged in  | Dashboard widgets load    |
| ADM-DASH-002 | View total users count        | Dashboard loaded | Count accurate            |
| ADM-DASH-003 | View active subscribers count | Dashboard loaded | Count accurate            |
| ADM-DASH-004 | View revenue metrics          | Dashboard loaded | Revenue data tampil       |
| ADM-DASH-005 | View subscriber growth chart  | Dashboard loaded | Chart renders correctly   |
| ADM-DASH-006 | View user by domicile chart   | Dashboard loaded | Pie/bar chart tampil      |
| ADM-DASH-007 | View user by JLPT level chart | Dashboard loaded | Distribution chart tampil |
| ADM-DASH-008 | View recent subscribers list  | Dashboard loaded | Recent subs with details  |
| ADM-DASH-009 | View active users card        | Dashboard loaded | Active count accurate     |
| ADM-DASH-010 | Refresh dashboard data        | Dashboard loaded | Data refreshes            |

---

### 3. Task/Roleplay Management

| ID           | Task                                  | Precondition        | Expected Result                |
| ------------ | ------------------------------------- | ------------------- | ------------------------------ |
| ADM-TASK-001 | View all tasks list                   | Admin logged in     | Task table loads               |
| ADM-TASK-002 | Search tasks by name                  | Tasks exist         | Search results accurate        |
| ADM-TASK-003 | Filter tasks by category              | Tasks exist         | Filtered correctly             |
| ADM-TASK-004 | Filter tasks by JLPT level            | Tasks exist         | Filtered correctly             |
| ADM-TASK-005 | Filter tasks by status                | Tasks exist         | Active/inactive filtered       |
| ADM-TASK-006 | View task detail                      | Task selected       | Full details tampil            |
| ADM-TASK-007 | Create new task - Basic info          | Di create form      | Title, description saved       |
| ADM-TASK-008 | Create new task - Category            | Di create form      | Category selected              |
| ADM-TASK-009 | Create new task - JLPT level          | Di create form      | Level selected                 |
| ADM-TASK-010 | Create new task - System prompt       | Di create form      | Prompt saved                   |
| ADM-TASK-011 | Create new task - Voice config        | Di create form      | Voice type selected            |
| ADM-TASK-012 | Create new task - Learning objectives | Di create form      | Objectives added               |
| ADM-TASK-013 | Create new task - Pre-study materials | Di create form      | Materials added                |
| ADM-TASK-014 | Create new task - Submit              | All fields complete | Task created                   |
| ADM-TASK-015 | Edit existing task                    | Task selected       | Edit form loads                |
| ADM-TASK-016 | Update task info                      | In edit mode        | Changes saved                  |
| ADM-TASK-017 | Delete task                           | Task selected       | Task removed dengan konfirmasi |
| ADM-TASK-018 | Toggle task active/inactive           | Task exists         | Status toggled                 |
| ADM-TASK-019 | Bulk import tasks                     | CSV/JSON file ready | Tasks imported                 |
| ADM-TASK-020 | View task analytics                   | Task selected       | Completion stats tampil        |

---

### 4. User Management

| ID           | Task                         | Precondition    | Expected Result              |
| ------------ | ---------------------------- | --------------- | ---------------------------- |
| ADM-USER-001 | View all users list          | Admin logged in | User table loads             |
| ADM-USER-002 | Search users by name/email   | Users exist     | Search results accurate      |
| ADM-USER-003 | Filter users by subscription | Users exist     | Filtered by tier             |
| ADM-USER-004 | Filter users by JLPT level   | Users exist     | Filtered by level            |
| ADM-USER-005 | Filter users by status       | Users exist     | Active/inactive filtered     |
| ADM-USER-006 | View user detail             | User selected   | Full profile tampil          |
| ADM-USER-007 | View user subscription info  | User selected   | Sub details tampil           |
| ADM-USER-008 | View user activity history   | User selected   | Activity log tampil          |
| ADM-USER-009 | View user credit balance     | User selected   | Credits accurate             |
| ADM-USER-010 | Manually adjust credits      | User selected   | Credits updated              |
| ADM-USER-011 | Export user data             | Users filtered  | CSV/Excel downloaded         |
| ADM-USER-012 | View detailed user table     | Di analytics    | Full table dengan pagination |

---

## 🟠 PRIORITAS MENENGAH (Important Admin Features)

### 5. Voucher Management

| ID          | Task                             | Precondition        | Expected Result          |
| ----------- | -------------------------------- | ------------------- | ------------------------ |
| ADM-VCH-001 | View all vouchers                | Admin logged in     | Voucher list loads       |
| ADM-VCH-002 | Search vouchers by code          | Vouchers exist      | Search results accurate  |
| ADM-VCH-003 | Filter vouchers by status        | Vouchers exist      | Active/expired filtered  |
| ADM-VCH-004 | Create new voucher - Code        | Di create form      | Code input validated     |
| ADM-VCH-005 | Create new voucher - Type        | Di create form      | Credit/discount selected |
| ADM-VCH-006 | Create new voucher - Value       | Di create form      | Amount/percentage set    |
| ADM-VCH-007 | Create new voucher - Expiry      | Di create form      | Date selected            |
| ADM-VCH-008 | Create new voucher - Usage limit | Di create form      | Limit set                |
| ADM-VCH-009 | Create new voucher - Submit      | All fields complete | Voucher created          |
| ADM-VCH-010 | Edit voucher                     | Voucher selected    | Edit form loads          |
| ADM-VCH-011 | Toggle voucher active/inactive   | Voucher exists      | Status toggled           |
| ADM-VCH-012 | View voucher redemption history  | Voucher selected    | Redemptions listed       |
| ADM-VCH-013 | Delete voucher                   | Voucher selected    | Voucher removed          |

---

### 6. Subscription & Revenue Analytics

| ID          | Task                           | Precondition    | Expected Result      |
| ----------- | ------------------------------ | --------------- | -------------------- |
| ADM-REV-001 | View earnings reports tab      | Admin logged in | Revenue data loads   |
| ADM-REV-002 | View revenue by period         | In earnings tab | Period data accurate |
| ADM-REV-003 | Filter revenue by date range   | In earnings tab | Data filtered        |
| ADM-REV-004 | View revenue breakdown by tier | In earnings tab | Per-tier breakdown   |
| ADM-REV-005 | View subscription tier stats   | In analytics    | Tier distribution    |
| ADM-REV-006 | View churn rate                | In analytics    | Churn % calculated   |
| ADM-REV-007 | Export revenue report          | Data filtered   | Report downloaded    |
| ADM-REV-008 | View payment transactions      | In revenue      | Transaction list     |

---

### 7. Practice & Usage Statistics

| ID           | Task                          | Precondition    | Expected Result   |
| ------------ | ----------------------------- | --------------- | ----------------- |
| ADM-STAT-001 | View practice stats tab       | Admin logged in | Stats data loads  |
| ADM-STAT-002 | View total roleplay sessions  | In stats tab    | Count accurate    |
| ADM-STAT-003 | View total free chat sessions | In stats tab    | Count accurate    |
| ADM-STAT-004 | View total drill sessions     | In stats tab    | Count accurate    |
| ADM-STAT-005 | View practice by JLPT level   | In stats tab    | Level breakdown   |
| ADM-STAT-006 | View most popular tasks       | In stats tab    | Task ranking      |
| ADM-STAT-007 | View token usage stats        | In stats tab    | AI token usage    |
| ADM-STAT-008 | Filter stats by date range    | In stats tab    | Data filtered     |
| ADM-STAT-009 | Export practice report        | Data ready      | Report downloaded |

---

### 8. Deck Management (Admin)

| ID           | Task                       | Precondition    | Expected Result         |
| ------------ | -------------------------- | --------------- | ----------------------- |
| ADM-DECK-001 | View all decks             | Admin logged in | Deck list loads         |
| ADM-DECK-002 | Filter decks by visibility | Decks exist     | Public/private filtered |
| ADM-DECK-003 | View deck details          | Deck selected   | Full info tampil        |
| ADM-DECK-004 | Feature/unfeature deck     | Deck selected   | Featured status toggled |
| ADM-DECK-005 | Delete inappropriate deck  | Deck selected   | Deck removed            |
| ADM-DECK-006 | View deck usage stats      | Deck selected   | Usage metrics tampil    |

---

## 🟡 PRIORITAS RENDAH (Supporting Admin Features)

### 9. Admin Account Management

| ID          | Task                     | Precondition   | Expected Result     |
| ----------- | ------------------------ | -------------- | ------------------- |
| ADM-ACC-001 | View all admin accounts  | Super admin    | Admin list loads    |
| ADM-ACC-002 | Create new admin account | Super admin    | Admin created       |
| ADM-ACC-003 | Edit admin account       | Admin selected | Info updated        |
| ADM-ACC-004 | Delete admin account     | Admin selected | Admin removed       |
| ADM-ACC-005 | Change own password      | Logged in      | Password updated    |
| ADM-ACC-006 | View admin profile       | Logged in      | Profile info tampil |
| ADM-ACC-007 | Edit admin profile       | Logged in      | Profile updated     |

---

### 10. System & Notifications

| ID          | Task                       | Precondition    | Expected Result            |
| ----------- | -------------------------- | --------------- | -------------------------- |
| ADM-SYS-001 | View API usage alerts      | Admin logged in | Alerts if any              |
| ADM-SYS-002 | View system notifications  | Admin logged in | Notifications load         |
| ADM-SYS-003 | Create system notification | Admin logged in | Notification sent to users |
| ADM-SYS-004 | View audit logs            | Super admin     | Activity logs tampil       |

---

### 11. Admin Navigation & UX

| ID          | Task                       | Precondition     | Expected Result           |
| ----------- | -------------------------- | ---------------- | ------------------------- |
| ADM-NAV-001 | Navigate via admin sidebar | Admin logged in  | All links work            |
| ADM-NAV-002 | Collapse/expand sidebar    | Admin logged in  | Sidebar toggles           |
| ADM-NAV-003 | View loading states        | Data loading     | Spinners/skeletons tampil |
| ADM-NAV-004 | View error states          | Error occurs     | Error message clear       |
| ADM-NAV-005 | Pagination on tables       | Data > page size | Pagination works          |
| ADM-NAV-006 | Sort table columns         | Table loaded     | Sorting works             |
| ADM-NAV-007 | Responsive admin layout    | Mobile/tablet    | Layout adapts             |

---

## Summary

| Priority    | Count        | Categories                         |
| ----------- | ------------ | ---------------------------------- |
| 🔴 Tinggi   | 39 tasks     | Auth, Dashboard, Tasks, Users      |
| 🟠 Menengah | 27 tasks     | Vouchers, Revenue, Stats, Decks    |
| 🟡 Rendah   | 18 tasks     | Admin Accounts, System, Navigation |
| **Total**   | **84 tasks** |                                    |

---

## Test Schedule Recommendation

| Week   | Focus Area             | Task IDs                            |
| ------ | ---------------------- | ----------------------------------- |
| Week 1 | Admin Auth & Dashboard | ADM-AUTH, ADM-DASH                  |
| Week 2 | Task Management        | ADM-TASK-001 to ADM-TASK-020        |
| Week 3 | User Management        | ADM-USER-001 to ADM-USER-012        |
| Week 4 | Voucher Management     | ADM-VCH-001 to ADM-VCH-013          |
| Week 5 | Revenue & Stats        | ADM-REV, ADM-STAT                   |
| Week 6 | Deck, Accounts, System | ADM-DECK, ADM-ACC, ADM-SYS, ADM-NAV |

---

## Security Considerations

| Check              | Description                                     | Priority |
| ------------------ | ----------------------------------------------- | -------- |
| Role-based access  | Verify super admin vs regular admin permissions | High     |
| Session management | Test session timeout and concurrent logins      | High     |
| Data export        | Ensure exported data is properly secured        | Medium   |
| Audit trail        | Verify admin actions are logged                 | Medium   |
| Input validation   | Test for SQL injection, XSS on admin forms      | High     |

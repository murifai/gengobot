# Gengobot - Test Case Template

> **Version**: 1.0
> **Last Updated**: 2024-11-29

---

## Quick Reference Templates

### Template A: Simple Test Case (Single Page)

```markdown
## Test Case: [TC-XXX-000]

**Feature**: [Feature Name]
**Module**: [Module Name]
**Priority**: [High/Medium/Low]
**Type**: [Functional/UI/Performance/Security]

### Test Information

| Field       | Value                               |
| ----------- | ----------------------------------- |
| Tester      |                                     |
| Date        |                                     |
| Environment | [Production/Staging/Local]          |
| Device      | [Desktop/Mobile iOS/Mobile Android] |
| Browser     | [Chrome/Safari/Firefox/Edge]        |

### Preconditions

- [ ] User is logged in
- [ ] [Other preconditions...]

### Test Steps

| Step | Action | Expected Result | Actual Result | Status |
| ---- | ------ | --------------- | ------------- | ------ |
| 1    |        |                 |               | ⬜     |
| 2    |        |                 |               | ⬜     |
| 3    |        |                 |               | ⬜     |

### Test Result

- [ ] ✅ PASSED
- [ ] ❌ FAILED
- [ ] ⏸️ BLOCKED
- [ ] ⏭️ SKIPPED

### Notes

[Additional observations, screenshots, etc.]

### Defects Found

| Defect ID | Description | Severity |
| --------- | ----------- | -------- |
|           |             |          |
```

---

### Template B: Detailed Test Case (Complex Flow)

```markdown
## Test Case: [TC-XXX-000]

**Feature**: [Feature Name]
**Module**: [Module Name]
**Priority**: [High/Medium/Low]
**Type**: [Functional/UI/Performance/Security]
**Estimated Time**: [X minutes]

---

### 1. Test Information

| Field           | Value      |
| --------------- | ---------- |
| Test Case ID    | TC-XXX-000 |
| Test Case Title |            |
| Created By      |            |
| Creation Date   |            |
| Last Modified   |            |
| Version         | 1.0        |

### 2. Test Environment

| Field             | Value                      |
| ----------------- | -------------------------- |
| Tester Name       |                            |
| Test Date         |                            |
| Environment       | [Production/Staging/Local] |
| Environment URL   |                            |
| Device Type       | [Desktop/Mobile]           |
| Device Model      |                            |
| OS Version        |                            |
| Browser           |                            |
| Browser Version   |                            |
| Screen Resolution |                            |
| Network           | [WiFi/4G/3G]               |

### 3. Test Data

| Data Item          | Value | Notes |
| ------------------ | ----- | ----- |
| Test User Email    |       |       |
| Test User Password |       |       |
| [Other test data]  |       |       |

### 4. Preconditions

- [ ] Application is accessible
- [ ] Test user account exists
- [ ] User is logged in
- [ ] [Specific preconditions...]

### 5. Test Steps

| Step | Action | Input Data | Expected Result | Actual Result | Screenshot | Status |
| ---- | ------ | ---------- | --------------- | ------------- | ---------- | ------ |
| 1    |        |            |                 |               |            | ⬜     |
| 2    |        |            |                 |               |            | ⬜     |
| 3    |        |            |                 |               |            | ⬜     |
| 4    |        |            |                 |               |            | ⬜     |
| 5    |        |            |                 |               |            | ⬜     |

### 6. Post-Conditions

- [ ] [Expected state after test completion]
- [ ] [Data cleanup if needed]

### 7. Test Result Summary

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Overall Status | ⬜ PASSED / ⬜ FAILED / ⬜ BLOCKED |
| Steps Passed   | /5                                 |
| Steps Failed   | /5                                 |
| Execution Time | minutes                            |

### 8. Defects Found

| Defect ID | Step | Description | Severity                   | Screenshot |
| --------- | ---- | ----------- | -------------------------- | ---------- |
| BUG-001   |      |             | [Critical/High/Medium/Low] |            |

### 9. Notes & Observations

## **Positive Observations:**

## **Issues/Concerns:**

## **Suggestions:**

### 10. Attachments

| File Name | Description | Link |
| --------- | ----------- | ---- |
|           |             |      |
```

---

## Filled Example Templates

### Example 1: Login Test Case

```markdown
## Test Case: TC-AUTH-001

**Feature**: User Login
**Module**: Authentication
**Priority**: High
**Type**: Functional

### Test Information

| Field       | Value        |
| ----------- | ------------ |
| Tester      | Budi Santoso |
| Date        | 2024-11-29   |
| Environment | Staging      |
| Device      | Desktop      |
| Browser     | Chrome 120   |

### Preconditions

- [x] User account exists with email: test@example.com
- [x] Application is accessible at staging URL

### Test Steps

| Step | Action                              | Expected Result                                    | Actual Result                  | Status |
| ---- | ----------------------------------- | -------------------------------------------------- | ------------------------------ | ------ |
| 1    | Navigate to /login                  | Login page displays with email and password fields | Login page displayed correctly | ✅     |
| 2    | Enter valid email: test@example.com | Email appears in input field                       | Email entered                  | ✅     |
| 3    | Enter valid password: Test123!      | Password masked in input field                     | Password masked                | ✅     |
| 4    | Click "Masuk" button                | Loading state shown, then redirect to /app         | Redirected to dashboard        | ✅     |
| 5    | Verify user session                 | User name displayed in header                      | "Budi" shown in header         | ✅     |

### Test Result

- [x] ✅ PASSED
- [ ] ❌ FAILED
- [ ] ⏸️ BLOCKED
- [ ] ⏭️ SKIPPED

### Notes

- Login response time: ~1.2 seconds
- Session cookie properly set

### Defects Found

| Defect ID | Description | Severity |
| --------- | ----------- | -------- |
| -         | None        | -        |
```

---

### Example 2: Roleplay Flow Test Case

```markdown
## Test Case: TC-RP-007

**Feature**: Start Roleplay Attempt
**Module**: Kaiwa - Roleplay
**Priority**: High
**Type**: Functional
**Estimated Time**: 10 minutes

---

### 1. Test Information

| Field           | Value                                   |
| --------------- | --------------------------------------- |
| Test Case ID    | TC-RP-007                               |
| Test Case Title | Start new roleplay conversation attempt |
| Created By      | QA Team                                 |
| Creation Date   | 2024-11-29                              |
| Version         | 1.0                                     |

### 2. Test Environment

| Field             | Value                       |
| ----------------- | --------------------------- |
| Tester Name       | Ani Wijaya                  |
| Test Date         | 2024-11-29                  |
| Environment       | Staging                     |
| Environment URL   | https://staging.gengobot.id |
| Device Type       | Mobile                      |
| Device Model      | iPhone 14                   |
| OS Version        | iOS 17.1                    |
| Browser           | Safari                      |
| Screen Resolution | 390x844                     |
| Network           | WiFi                        |

### 3. Test Data

| Data Item         | Value               | Notes                    |
| ----------------- | ------------------- | ------------------------ |
| Test User Email   | tester@gengobot.id  | Has active subscription  |
| Task ID           | task_restaurant_001 | Restaurant ordering task |
| JLPT Level        | N5                  | Beginner level           |
| Credits Available | 50                  | Sufficient for test      |

### 4. Preconditions

- [x] Application is accessible
- [x] Test user account exists with active subscription
- [x] User has sufficient credits (minimum 5)
- [x] User is logged in
- [x] Task "Memesan di Restoran" exists and is active

### 5. Test Steps

| Step | Action                         | Input Data | Expected Result                                   | Actual Result                           | Screenshot        | Status |
| ---- | ------------------------------ | ---------- | ------------------------------------------------- | --------------------------------------- | ----------------- | ------ |
| 1    | Navigate to Kaiwa page         | -          | Kaiwa hub with Roleplay and Ngobrol Bebas options | Options displayed                       | kaiwa-hub.png     | ✅     |
| 2    | Tap "Roleplay" card            | -          | Roleplay task list displayed                      | Task list loaded                        | roleplay-list.png | ✅     |
| 3    | Search for "restoran"          | "restoran" | Restaurant tasks filtered                         | 3 tasks shown                           | search-result.png | ✅     |
| 4    | Tap task "Memesan di Restoran" | -          | Task detail page with pre-study materials         | Detail page loaded                      | task-detail.png   | ✅     |
| 5    | Review learning objectives     | -          | 3 objectives displayed                            | Objectives shown                        | objectives.png    | ✅     |
| 6    | Tap "Mulai Latihan" button     | -          | Loading, then chat interface opens                | Chat opened                             | chat-start.png    | ✅     |
| 7    | Wait for AI greeting           | -          | AI character sends greeting message in Japanese   | Greeting received: "いらっしゃいませ！" | ai-greeting.png   | ✅     |
| 8    | Verify credit deduction        | -          | Credits reduced by 1                              | Credits: 50 → 49                        | credits.png       | ✅     |

### 6. Post-Conditions

- [x] New task attempt created in database
- [x] User credit balance reduced
- [x] Activity logged in recent activity

### 7. Test Result Summary

| Field          | Value     |
| -------------- | --------- |
| Overall Status | ✅ PASSED |
| Steps Passed   | 8/8       |
| Steps Failed   | 0/8       |
| Execution Time | 4 minutes |

### 8. Defects Found

| Defect ID | Step | Description | Severity | Screenshot |
| --------- | ---- | ----------- | -------- | ---------- |
| -         | -    | None found  | -        | -          |

### 9. Notes & Observations

**Positive Observations:**

- Smooth loading transition between pages
- AI greeting response time < 2 seconds
- Credit deduction real-time update visible

**Issues/Concerns:**

- None

**Suggestions:**

- Consider adding loading skeleton for task list

### 10. Attachments

| File Name         | Description          | Link                    |
| ----------------- | -------------------- | ----------------------- |
| kaiwa-hub.png     | Kaiwa hub screenshot | /screenshots/tc-rp-007/ |
| roleplay-list.png | Task list screenshot | /screenshots/tc-rp-007/ |
```

---

### Example 3: Failed Test Case

```markdown
## Test Case: TC-FC-005

**Feature**: Voice Input in Free Chat
**Module**: Kaiwa - Ngobrol Bebas
**Priority**: High
**Type**: Functional

### Test Information

| Field       | Value          |
| ----------- | -------------- |
| Tester      | Dian Pratama   |
| Date        | 2024-11-29     |
| Environment | Production     |
| Device      | Mobile Android |
| Browser     | Chrome 120     |

### Preconditions

- [x] User is logged in
- [x] Character selected for chat
- [x] Microphone permission granted

### Test Steps

| Step | Action                           | Expected Result                       | Actual Result                     | Status |
| ---- | -------------------------------- | ------------------------------------- | --------------------------------- | ------ |
| 1    | Tap microphone button            | Recording indicator appears           | Recording indicator appeared      | ✅     |
| 2    | Speak "こんにちは" for 3 seconds | Audio visualizer shows activity       | Visualizer active                 | ✅     |
| 3    | Tap stop button                  | Recording stops, transcription starts | Recording stopped                 | ✅     |
| 4    | Wait for transcription           | Japanese text appears in input field  | **ERROR: "Transcription failed"** | ❌     |
| 5    | Message auto-sends               | Message sent, AI responds             | Not executed (blocked)            | ⏸️     |

### Test Result

- [ ] ✅ PASSED
- [x] ❌ FAILED
- [ ] ⏸️ BLOCKED
- [ ] ⏭️ SKIPPED

### Notes

- Error occurred consistently on 3 retry attempts
- Works fine on iOS Safari
- Console error: "Whisper API timeout after 30s"
- Network was stable (50 Mbps WiFi)

### Defects Found

| Defect ID    | Description                                                    | Severity |
| ------------ | -------------------------------------------------------------- | -------- |
| BUG-2024-089 | Voice transcription fails on Android Chrome with timeout error | High     |

### Defect Details

**BUG-2024-089**

- **Summary**: Voice transcription timeout on Android
- **Steps to Reproduce**:
  1. Login on Android Chrome
  2. Go to Free Chat
  3. Record voice message
  4. Stop recording
- **Expected**: Transcription appears
- **Actual**: "Transcription failed" error
- **Frequency**: 100% reproducible
- **Workaround**: Use text input instead
- **Screenshots**: bug-089-error.png, bug-089-console.png
```

---

## Test Status Legend

| Symbol | Status      | Description                   |
| ------ | ----------- | ----------------------------- |
| ⬜     | Not Tested  | Test step not yet executed    |
| ✅     | Passed      | Test step passed successfully |
| ❌     | Failed      | Test step failed              |
| ⏸️     | Blocked     | Cannot execute due to blocker |
| ⏭️     | Skipped     | Intentionally skipped         |
| 🔄     | In Progress | Currently being tested        |

---

## Severity Levels

| Level        | Description                              | Response Time          |
| ------------ | ---------------------------------------- | ---------------------- |
| **Critical** | App crash, data loss, security breach    | Immediate fix required |
| **High**     | Major feature broken, no workaround      | Fix within 24 hours    |
| **Medium**   | Feature partially broken, has workaround | Fix within 1 week      |
| **Low**      | Minor UI issue, cosmetic                 | Fix in next release    |

---

## Test Report Template

```markdown
# Test Execution Report

**Project**: Gengobot
**Test Cycle**: [Cycle Name/Sprint]
**Date Range**: [Start Date] - [End Date]
**Prepared By**: [Name]

## Executive Summary

| Metric           | Value |
| ---------------- | ----- |
| Total Test Cases |       |
| Executed         |       |
| Passed           |       |
| Failed           |       |
| Blocked          |       |
| Pass Rate        | %     |

## Test Coverage by Module

| Module            | Total | Passed | Failed | Blocked | Pass Rate |
| ----------------- | ----- | ------ | ------ | ------- | --------- |
| Authentication    |       |        |        |         | %         |
| Kaiwa - Roleplay  |       |        |        |         | %         |
| Kaiwa - Free Chat |       |        |        |         | %         |
| Drill             |       |        |        |         | %         |
| Subscription      |       |        |        |         | %         |
| Profile           |       |        |        |         | %         |
| Admin             |       |        |        |         | %         |

## Defects Summary

| Severity | Open | Fixed | Total |
| -------- | ---- | ----- | ----- |
| Critical |      |       |       |
| High     |      |       |       |
| Medium   |      |       |       |
| Low      |      |       |       |

## Top Defects

| ID  | Title | Severity | Status | Module |
| --- | ----- | -------- | ------ | ------ |
|     |       |          |        |        |

## Risks & Issues

| Risk/Issue | Impact | Mitigation |
| ---------- | ------ | ---------- |
|            |        |            |

## Recommendations

1.
2.
3.

## Sign-Off

| Role          | Name | Signature | Date |
| ------------- | ---- | --------- | ---- |
| QA Lead       |      |           |      |
| Dev Lead      |      |           |      |
| Product Owner |      |           |      |
```

---

## File Naming Convention

```
TC-[MODULE]-[NUMBER]_[Description]_[Version].md

Examples:
- TC-AUTH-001_Login_Valid_v1.md
- TC-RP-007_Start_Roleplay_v2.md
- TC-SUB-010_Payment_Midtrans_v1.md
```

## Folder Structure

```
docs/testing/
├── USER_USABILITY_TEST.md
├── ADMIN_USABILITY_TEST.md
├── TEST_CASE_TEMPLATE.md
├── test-cases/
│   ├── auth/
│   │   ├── TC-AUTH-001_Login_Valid.md
│   │   └── TC-AUTH-002_Login_Invalid.md
│   ├── kaiwa/
│   │   ├── TC-RP-001_Browse_Tasks.md
│   │   └── TC-FC-001_Select_Character.md
│   ├── drill/
│   ├── subscription/
│   ├── profile/
│   └── admin/
├── test-reports/
│   ├── 2024-11/
│   │   └── Sprint_23_Report.md
│   └── 2024-12/
└── screenshots/
    ├── tc-auth-001/
    └── tc-rp-007/
```

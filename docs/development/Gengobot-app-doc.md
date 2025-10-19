# Gengobot

## Technical Documentation & Specifications

## 1. Application Overview

**Application Name:** Gengobot

Gengotalk is a web-based application designed to enhance Japanese speaking skills through AI-driven roleplay conversations. Built with a task-based approach, it offers a unique and interactive way for learners to practice real-world conversations in various settings.

### Core Concept

- Interactive AI-driven roleplay conversations for Japanese language learning
- Focus on task-based language teaching methodology
- Proficiency levels based on JLPT standards (N1-N5)
- Emphasis on practical, real-world communication scenarios
- Designed to improve fluency, vocabulary, and reduce speech anxiety
- Integrated spaced repetition system (Anki-like) for vocabulary and grammar retention

## 2. Feature Overview

### Primary Modes

1. **Task-Based Chat**: Structured scenarios with specific learning objectives
2. **Free Chat**: Open-ended conversations with customizable AI characters
3. **Flashcard Study**: Anki-like spaced repetition system for vocabulary and grammar
4. **JLPT Tryout**: Full-scale practice tests for all JLPT levels (N1-N5) with authentic scoring

### Key Features

- **User Survey**: Initial proficiency assessment and learning preference survey
- Voice recognition and speech-to-text functionality
- Text-to-speech AI responses
- Performance assessment and feedback
- Progress tracking and statistics
- Custom character creation
- Various difficulty levels (aligned with JLPT N1-N5)
- Categorized conversation scenarios
- **Spaced repetition flashcard system**
- **Deck management with vocabulary and grammar cards**
- **Task-deck integration for targeted learning**
- **Review scheduling based on performance**
- **JLPT practice tests with authentic scoring system**
- **Comprehensive test analytics and progress tracking**
- **Section-based and overall performance assessment**

## 3. User Flows

### Free Chat Flow

1. User logs in or starts the application
2. User selects "Free Chat" mode
3. User creates or selects a custom character with:
   - Name
   - Personality traits
   - Speaking style
   - Relationship type
4. User begins chat session
5. Conversation interface provides:
   - Text input/output
   - Voice recording capability
   - Audio playback
6. User speaks or types their message
7. AI processes input (Speech-to-Text if voice)
8. AI generates an appropriate response
9. AI speaks the response (Text-to-Speech)
10. Decision point: Continue chat?
    - If Yes: Return to step 6 (continuous chat loop)
    - If No: Save conversation and return to dashboard

### Task-Based Chat Flow

1. User logs in or starts the application
2. Select Task-Based Chat
3. Select Task
   - By Difficulty
   - By Category
4. **Pre-Task Study (Optional)**
   - Review vocabulary deck associated with task
   - Review grammar deck associated with task
   - Quick flashcard session for preparation
5. Begin Task
6. Conversation Interface
   - Text Input/Output
   - Voice Recording
   - Audio Playback
   - Task Progress Indicator
   - **Real-time vocabulary hints from associated deck**
7. User Speaks/Types
8. AI Processes Input (Speech-to-Text)
9. AI Generates Response
10. AI Speaks Response (Text-to-Speech)
11. Task Complete?
    - If No: Continue Task Conversation (return to step 7)
    - If Yes: Proceed to Task Assessment
12. Task Assessment
    - Accuracy Score
    - Fluency Score
    - Completion Score
    - Feedback
    - **Vocabulary usage analysis**
13. **Post-Task Review**
    - Add encountered vocabulary to review queue
    - Update card performance based on usage
14. Update Progress Records
15. Save Conversation
16. Return to Dashboard

### Flashcard Study Flow

1. User selects "Study" mode from dashboard
2. System presents study options:
   - **Due Reviews**: Cards scheduled for review
   - **Deck Browse**: Study specific decks
   - **Task Preparation**: Study cards for upcoming tasks
3. User selects study type
4. **Flashcard Session**:
   - Card presentation (front side)
   - User attempts recall
   - User reveals answer (back side)
   - User rates difficulty (Again, Hard, Good, Easy)
   - System calculates next review date using spaced repetition
5. Continue until session complete or user stops
6. **Session Summary**:
   - Cards reviewed
   - Performance statistics
   - Next review schedule
7. Return to dashboard

### User Survey Flow (Initial Setup)

1. **First-time user registration/login**
2. **Welcome and Introduction**
   - Brief app overview
   - Purpose of the survey
   - **Privacy and Data Usage Policy**
     - **Data collection transparency**
     - **Research usage consent**: Survey data and analytics may be used for research purposes to improve Japanese language learning methodologies
     - **Data anonymization**: Personal identifiers removed for research use
     - **Opt-out options**: Users can choose to exclude their data from research studies
     - **Academic partnerships**: Data may be shared with educational institutions for language learning research
     - **User consent confirmation**: Explicit consent required for research data usage
3. **Background Information Assessment**
   - **Age Group**: 10代, 20代, 30代, 答えたくない (10s, 20s, 30s, prefer not to answer)
   - **Gender**: 男性, 女性, 答えたくない (Male, Female, prefer not to answer)
   - **Occupation**: 学生, 大学生, 日本語学校の学生, 社会人, パート・アルバイト, 技能実習生, 特定技能生, 留学生, その他
     (Student, University student, Japanese language school student, Working adult, Part-time worker, Technical intern, Specific skilled worker, International student, Other)
4. **Learning Purpose and Goals Assessment**
   - **Purpose for Learning Japanese**:
     - 日本で働くため (To work in Japan)
     - 日本の学校に入学するため (To enter Japanese schools)
     - 日本人と話したいから (To talk with Japanese people)
     - アニメ・マンガ・ドラマが好きだから (Because I like anime/manga/drama)
     - その他 (Other)
5. **Current Proficiency Assessment**
   - **Current Japanese Level**: N5, N4, N3, N2, N1, わかりません (Don't know)
   - **Learning Duration**: 1か月未満, 1−2か月間, 3−4か月間, 5−12月間, 一年以上
     (Less than 1 month, 1-2 months, 3-4 months, 5-12 months, Over 1 year)
   - **Speaking Opportunities**: 授業, 家庭, 友達との会話, その他, 全く使わない
     (In class, At home, Conversation with friends, Other, Don't use at all)
6. **Technology Experience Assessment**
   - **Previous App Usage**: 日本語学習アプリを使ったことがありますか (Have you used Japanese learning apps?)
   - **App Experience**: Duolingo, Busuu, HelloTalk, Mazii, その他 (Other)
   - **Conversation Practice Frequency**: よくする, ときどきする, あまりしない, 全くしない
     (Often, Sometimes, Rarely, Never)
7. **Learning Preferences Survey**
   - Primary learning goals (conversation, reading, listening, writing, JLPT preparation)
   - Preferred learning style (visual, auditory, kinesthetic, reading/writing)
   - Time availability (daily study time, session length preferences)
   - Difficulty preference (gradual progression vs. challenge-focused)
8. **Interest and Motivation Assessment**
   - Topics of interest (travel, business, anime/manga, culture, daily life)
   - Motivation factors (career, travel, personal interest, academic)
   - Preferred conversation scenarios
9. **Technical Preferences**
   - Voice interaction preference
   - Feedback style preference (detailed vs. concise)
   - Progress tracking preferences
10. **Survey Completion**
    - Generate personalized learning recommendations
    - Set up initial deck subscriptions
    - Configure difficulty levels
    - Create initial learning path
11. **Onboarding Tutorial**
    - Quick walkthrough of main features
    - First task recommendation
    - Dashboard orientation
12. **Proceed to Dashboard**

### JLPT Tryout Flow

1. **User selects "JLPT Tryout" from dashboard**
2. **Test Level Selection**
   - Choose from available levels (N1, N2, N3, N4, N5)
   - View test overview and requirements
   - Review estimated completion time
3. **Test Type Selection**
   - **Full Test**: Complete practice test with all sections
   - **Section Practice**: Focus on specific sections (Vocabulary, Grammar & Reading, Listening)
   - **Timed Practice**: Test under time constraints
   - **Untimed Practice**: Study mode without time pressure
4. **Pre-Test Setup**
   - Review test instructions
   - Audio and system check
   - Select answer submission method (click/keyboard)
5. **Test Sections** (varies by level):
   - **N5/N4**: Language Knowledge (V+G+R) + Listening
   - **N1/N2/N3**: Vocabulary + Grammar & Reading + Listening
6. **Section Execution**
   - **Problem-by-problem progression**
   - **Answer selection and confirmation**
   - **Section timer (if timed mode)**
   - **Navigation controls (next, previous, flag for review)**
   - **Progress indicator**
7. **Section Completion**
   - **Section review (if time permits)**
   - **Flagged questions review**
   - **Confirm section submission**
8. **Test Completion**
   - **Final review opportunity**
   - **Submit complete test**
9. **Score Calculation**
   - **Raw score calculation per section**
   - **Scaled score conversion (0-60 per section, 0-180 total)**
   - **Pass/fail determination**
   - **Sectional pass mark analysis**
10. **Results Display**
    - **Overall score and pass/fail status**
    - **Section-by-section breakdown**
    - **Performance analysis and recommendations**
    - **Comparison with previous attempts**
    - **Detailed answer review**
11. **Post-Test Actions**
    - **Save test results**
    - **Generate study recommendations**
    - **Add vocabulary from test to review queue**
    - **Schedule follow-up practice**
12. **Return to Dashboard**

## 4. Site Architecture

### User-Facing Pages

**Home (/)**

- User Authentication
  - Login
  - Register
  - Password Recovery

**Dashboard (/dashboard)**

- User Profile
  - View/Edit Profile
  - Proficiency Level Settings
- Progress Tracking
  - Overall Statistics
  - Conversation History
  - Performance Metrics
  - **Flashcard Study Progress**
  - **Due Reviews Counter**
- **Quick Actions**
  - **Start Due Reviews**
  - **Browse Decks**
  - **Continue Last Task**

**Study (/study)**

- **Study Dashboard**
  - **Due Reviews Summary**
  - **Deck Overview**
  - **Study Statistics**
- **Review Session (/study/reviews)**
  - **Flashcard Interface**
  - **Difficulty Rating (Again, Hard, Good, Easy)**
  - **Progress Indicator**
  - **Session Controls (Pause, End)**
- **Deck Browser (/study/decks)**
  - **All Decks View**
  - **Filter by Category (Vocabulary, Grammar, JLPT Level)**
  - **Search Decks**
  - **Deck Statistics**
- **Individual Deck (/study/decks/[id])**
  - **Deck Information**
  - **Card List**
  - **Study Options (All Cards, Due Only, New Cards)**
  - **Deck Statistics**
- **Card Editor (/study/cards/[id])**
  - **Edit Card Content**
  - **Add Audio/Images**
  - **Set Card Type**
  - **Difficulty Level**

**JLPT Tryout (/jlpt-tryout)**

- **Test Selection Dashboard**
  - **Available Levels (N1-N5)**
  - **Test Type Selection (Full, Section, Timed, Untimed)**
  - **Previous Test Results Summary**
  - **Estimated Completion Time**
  - **Test Overview and Instructions**
- **Test Interface (/jlpt-tryout/[level]/test)**
  - **Section-by-Section Navigation**
  - **Question Display with Multiple Choice Options**
  - **Timer (for timed tests)**
  - **Progress Indicator**
  - **Flag for Review Functionality**
  - **Answer Confirmation**
  - **Section Submission**
- **Test Results (/jlpt-tryout/[level]/results/[testId])**
  - **Overall Score Display (0-180 scale)**
  - **Section Breakdown (Vocabulary, Grammar & Reading, Listening)**
  - **Pass/Fail Status with Sectional Requirements**
  - **Performance Analysis and Recommendations**
  - **Answer Review with Explanations**
  - **Comparison with Previous Attempts**
  - **Study Recommendations**
- **Test History (/jlpt-tryout/history)**
  - **All Test Attempts**
  - **Progress Tracking Over Time**
  - **Performance Trends**
  - **Level-specific Statistics**
- **Test Analytics (/jlpt-tryout/analytics)**
  - **Detailed Performance Analytics**
  - **Strengths and Weaknesses Analysis**
  - **Recommendation Engine**
  - **Study Plan Generation**

**User Survey (/survey)**

- **Welcome Page**
  - **Survey Introduction**
  - **Purpose and Benefits**
  - **Privacy and Data Usage Policy**
    - **Research Data Usage Consent**
    - **Data Anonymization Process**
    - **Opt-out Options**
    - **Academic Partnership Disclosure**
  - **Estimated Completion Time**
- **Privacy Consent (/survey/privacy)**
  - **Detailed Privacy Policy**
  - **Research Data Usage Agreement**
  - **Data Anonymization Explanation**
  - **Consent Checkboxes**
    - **General data collection consent**
    - **Research usage consent (optional)**
    - **Academic partnership consent (optional)**
    - **Analytics and improvement consent**
  - **Right to Withdraw Consent**
  - **Contact Information for Privacy Concerns**
- **Background Information (/survey/background)**
  - **Age Group Selection**
  - **Gender Selection**
  - **Occupation Selection**
  - **Demographic Data Collection**
- **Learning Purpose (/survey/purpose)**
  - **Learning Goals Assessment**
  - **Motivation Analysis**
  - **Primary Objectives Selection**
  - **Custom Goal Input**
- **Proficiency Assessment (/survey/proficiency)**
  - **Current JLPT Level Selection**
  - **Learning Duration Assessment**
  - **Speaking Opportunities Evaluation**
  - **Skill Level Validation**
- **Technology Experience (/survey/technology)**
  - **Previous App Usage Assessment**
  - **App Experience Evaluation**
  - **Conversation Practice Frequency**
  - **Digital Learning Comfort Level**
- **Learning Preferences (/survey/preferences)**
  - **Learning Style Assessment**
  - **Study Time Availability**
  - **Difficulty Preferences**
  - **Content Type Preferences**
- **Interest Assessment (/survey/interests)**
  - **Topic Preferences**
  - **Cultural Interest Areas**
  - **Scenario Preferences**
  - **Content Personalization**
- **Technical Preferences (/survey/technical)**
  - **Voice Interaction Settings**
  - **Feedback Style Preferences**
  - **Progress Tracking Options**
  - **Accessibility Preferences**
- **Survey Completion (/survey/complete)**
  - **Personalized Recommendations**
  - **Initial Deck Subscriptions**
  - **Difficulty Level Configuration**
  - **Learning Path Setup**
- **Onboarding Tutorial (/survey/onboarding)**
  - **Feature Walkthrough**
  - **First Task Recommendation**
  - **Dashboard Orientation**
  - **Quick Start Guide**

**Free Chat (/free-chat)**

- Custom Character Creation
  - Name & Basic Info
  - Personality Traits Selection
    - Personality Type
    - Speaking Style
    - Interests/Hobbies
    - Background Story
  - Relationship Type
  - Save Character
- My Characters
  - View Saved Characters
  - Edit Characters
  - Delete Characters
- Conversation Interface
  - Text Input/Output
  - Voice Recording Controls
  - Audio Playback Controls
  - Visual Feedback

**Task-Based Chat (/task-chat)**

- Task Selection
  - By Difficulty Level
    - Beginner
    - Intermediate
    - Advanced
  - By Category
    - Restaurant Scenarios
    - Shopping Scenarios
    - Travel Scenarios
  - **Associated Deck Preview**
  - **Vocabulary Count**
- Task Details
  - Task Description
  - Learning Objectives
  - **Associated Vocabulary Deck**
  - **Associated Grammar Deck**
  - **Pre-Study Option**
  - Start Task
- **Pre-Task Study (/task-chat/[id]/study)**
  - **Quick Deck Review**
  - **Key Vocabulary Preview**
  - **Grammar Points**
  - **Proceed to Task**
- Conversation Interface
  - Text Input/Output
  - Voice Recording Controls
  - Audio Playback Controls
  - Task Progress Indicator
  - **Vocabulary Hints Panel**
  - **Real-time Deck Integration**
  - Assessment Results
- **Post-Task Review (/task-chat/[id]/review)**
  - **Vocabulary Used**
  - **Missed Opportunities**
  - **Add to Review Queue**
  - **Performance Analysis**

**Settings (/settings)**

- Account Settings
- Audio Settings
- Language Preferences (UI Language)
- **Study Settings**
  - **Review Limits**
  - **Spaced Repetition Parameters**
  - **Deck Preferences**

**Test Page (/test)**

- System Testing Interface

### Admin Pages

**Admin Dashboard (/admin/dashboard)**

- Overview Statistics
- **Deck Management Statistics**
- **Card Creation Analytics**

**Character Management (/admin/characters)**

- Character List
- Add New Character
- Edit Character
  - Name
  - Description
  - Personality
  - Save Changes
- Delete Character

**Task Management (/admin/tasks)**

- Task List
- Add New Task
- Edit Task
  - Title
  - Category
  - Description
  - Scenario
  - Difficulty
  - **Associated Vocabulary Deck**
  - **Associated Grammar Deck**
  - **Learning Objectives**
  - Save Changes
- Delete Task

**Deck Management (/admin/decks)**

- **Deck List**
  - **Filter by Type (Vocabulary, Grammar)**
  - **Filter by JLPT Level**
  - **Search Decks**
- **Add New Deck**
  - **Deck Name**
  - **Description**
  - **Category (Vocabulary/Grammar)**
  - **JLPT Level**
  - **Tags**
- **Edit Deck (/admin/decks/[id])**
  - **Deck Information**
  - **Card Management**
  - **Bulk Import/Export**
  - **Statistics**
- **Card Management (/admin/cards)**
  - **Card List**
  - **Add New Card**
  - **Bulk Operations**
  - **Import from CSV**
- **Add/Edit Card (/admin/cards/[id])**
  - **Front Content (Japanese)**
  - **Back Content (English/Explanation)**
  - **Audio File**
  - **Image**
  - **Card Type (Vocabulary, Grammar, Kanji)**
  - **Difficulty Level**
  - **Tags**
  - **Associated Tasks**

**Admin Settings (/admin/settings)**

- Admin Account Settings
- System Configuration
- **Spaced Repetition Algorithm Settings**

**JLPT Tryout Management (/admin/jlpt)**

- **Test Content Management**
  - **Test Bank Overview**
  - **Question Management by Level**
  - **Answer Key Configuration**
  - **Difficulty Level Assignment**
- **Test Creation (/admin/jlpt/create)**
  - **Question Builder Interface**
  - **Audio File Upload**
  - **Image Management**
  - **Test Validation**
- **Test Analytics (/admin/jlpt/analytics)**
  - **Test Performance Statistics**
  - **Question Analysis**
  - **Pass Rate Tracking**
  - **Difficulty Calibration**
- **Scoring Configuration (/admin/jlpt/scoring)**
  - **Scoring Algorithm Settings**
  - **Pass Mark Configuration**
  - **Sectional Requirements**
  - **Score Scaling Parameters**

**User Survey Management (/admin/survey)**

- **Survey Configuration**
  - **Question Management**
  - **Response Options**
  - **Survey Flow Control**
  - **Personalization Logic**
- **Survey Analytics (/admin/survey/analytics)**
  - **Response Statistics**
  - **User Profiling Data**
  - **Recommendation Performance**
  - **Completion Rates**
- **Survey Settings (/admin/survey/settings)**
  - **Question Types Configuration**
  - **Scoring Weights**
  - **Recommendation Rules**
  - **Onboarding Flow**
- **Research Data Management (/admin/research)**
  - **Consent Management**
    - **User Consent Status Overview**
    - **Consent Withdrawal Requests**
    - **Privacy Policy Version Management**
    - **Consent Compliance Reporting**
  - **Data Anonymization (/admin/research/anonymize)**
    - **Anonymization Process Controls**
    - **Data Export for Research**
    - **Anonymized Dataset Generation**
    - **Privacy Compliance Validation**
  - **Research Analytics (/admin/research/analytics)**
    - **Research Usage Statistics**
    - **Data Access Audit Logs**
    - **Consent Analytics**
    - **Privacy Compliance Reports**

## 5. Technology Stack

### 1. Client Layer

- Frontend Framework: Next.js with TypeScript
- UI Library: Tailwind CSS
- State Management: React Context
- Audio Processing: Web Speech API
- Testing: Jest with ts-jest

### 2. Backend & Authentication

- Backend Framework: Express.js with TypeScript
- Authentication: Supabase Auth
- API Documentation: OpenAPI/Swagger with tsoa

### 3. Core Features

- Conversation Engine: TypeScript modules for OpenAI integration
- Task Management: Express.js endpoints with TypeScript
- Assessment Engine: TypeScript module

### 4. AI/ML Layer

- LLM: OpenAI API with typed SDK
- STT Service: OpenAI Whisper API
- TTS Service: OpenAI API
- Prompt Management: Type-safe template system

### 5. Data Layer

- Database: PostgreSQL via Supabase
- Storage: Supabase Storage
- Database Access: Prisma ORM

### 6. DevOps/Infrastructure

- Deployment: Railway
- Local Development: Docker with TypeScript configuration
- CI/CD: GitHub Actions
- Logging: Railway built-in logs

### 7. Development Tools

- Version Control: GitHub
- Project Management: GitHub Issues
- Code Quality: ESLint with TypeScript support
- Documentation: GitHub README and TypeDoc

## 6. Design System & UI Guidelines

### Color Hierarchy

The application uses a carefully crafted color palette that aligns with the Japanese language learning theme:

**Primary Colors:**

- **Primary**: `#ff5e75` (Coral Pink)
  - Full shade range from 50-950 for various UI states
  - Used for main CTAs, active states, and primary branding

**Secondary Colors:**

- **Secondary**: `#1dcddc` (Turquoise)
  - Full shade range from 50-950 for various UI states
  - Used for secondary actions, highlights, and accents

**Tertiary Colors:**

- **Tertiary Yellow**: `#fdf29d` (Light Yellow)
- **Tertiary Green**: `#8bd17b` (Light Green)
- **Tertiary Purple**: `#4a3e72` (Dark Purple)
- Used for additional UI elements, status indicators, and visual variety

**Neutral Colors:**

- **Dark/Black**: `#0c1231` (Dark Blue-Black)
- Used for text, backgrounds, and high-contrast elements

## 7. Database Schema

Key database models include:

- **Task Model**
  - id: Unique identifier
  - title: Task name
  - description: Detailed task description
  - category: Task category (Jalan-Jalan, Keseharian, Tempat Kerja)
  - sub-category: Jalan-Jalan(Jalan-jalan di Kota, Makan di Luar, , Naik Transportasi, Tempat Wisata)
    Keseharian (Belanja, Pos & Bank, Layanan UmumKegiatan Masyarakat, Rumah Sakit, Situasi Darurat, Percakapan Sehari-hari)
    Tempat Kerja (Teman Kerja, Atasan)
  - difficulty: CEFR level (A1-C2) with JLPT level approximation
  - scenario: Detailed scenario description
  - learningObjectives: Array of learning goals
  - successCriteria: Completion requirements
  - **vocabDeckId: Foreign key to associated vocabulary deck**
  - **grammarDeckId: Foreign key to associated grammar deck**
  - estimatedDuration: Expected completion time
  - prerequisites: Required prior knowledge
  - characterId: Associated character for the task
  - isActive: Whether task is available to users
  - createdAt: Creation timestamp
  - updatedAt: Last modification timestamp
  - createdBy: Admin user who created the task
  - usageCount: Number of times task has been attempted
  - averageScore: Average completion score across all attempts

- **Deck Model**
  - **id: Unique identifier**
  - **name: Deck name**
  - **description: Deck description**
  - **category: Deck category (vocabulary, grammar, kanji)**
  - **jlptLevel: JLPT level (N5, N4, N3, N2, N1)**
  - **tags: Array of tags for organization**
  - **isPublic: Whether deck is available to all users**
  - **createdBy: User who created the deck**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**
  - **cardCount: Number of cards in deck**
  - **difficulty: Overall difficulty rating**
  - **estimatedStudyTime: Estimated time to complete deck**

- **Card Model**
  - **id: Unique identifier**
  - **deckId: Foreign key to parent deck**
  - **front: Front content (Japanese text/question)**
  - **back: Back content (English/explanation)**
  - **reading: Furigana/reading for Japanese text**
  - **cardType: Type of card (vocabulary, grammar, kanji, sentence)**
  - **difficulty: Individual card difficulty**
  - **tags: Array of tags**
  - **notes: Additional notes or context**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**
  - **createdBy: User who created the card**
  - **usageCount: Number of times card has been studied**
  - **averageEase: Average ease factor from reviews**

- **CardReview Model**
  - **id: Unique identifier**
  - **userId: User who reviewed the card**
  - **cardId: Card being reviewed**
  - **reviewDate: Date of review**
  - **rating: User rating (1=Again, 2=Hard, 3=Good, 4=Easy)**
  - **responseTime: Time taken to respond**
  - **ease: Ease factor after review**
  - **interval: Days until next review**
  - **repetitions: Number of successful repetitions**
  - **lapses: Number of times card was failed**
  - **studySessionId: Associated study session**
  - **previousInterval: Previous interval before this review**
  - **isNew: Whether this was the first review**

- **StudySession Model**
  - **id: Unique identifier**
  - **userId: User who conducted the session**
  - **deckId: Deck being studied (optional)**
  - **startTime: Session start time**
  - **endTime: Session end time**
  - **sessionType: Type of session (review, new_cards, cram, task_prep)**
  - **cardsStudied: Number of cards studied**
  - **newCards: Number of new cards introduced**
  - **reviewCards: Number of review cards**
  - **lapses: Number of failed cards**
  - **averageResponseTime: Average response time**
  - **completionRate: Percentage of cards completed**
  - **taskId: Associated task (if task preparation session)**

- **UserDeckProgress Model**
  - **id: Unique identifier**
  - **userId: User identifier**
  - **deckId: Deck identifier**
  - **subscribedAt: When user subscribed to deck**
  - **lastStudied: Last study session date**
  - **totalStudyTime: Total time spent studying deck**
  - **cardsMastered: Number of cards mastered**
  - **cardsLearning: Number of cards currently learning**
  - **cardsNew: Number of new cards remaining**
  - **averageEase: Average ease factor for this deck**
  - **completionPercentage: Percentage of deck completed**
  - **isActive: Whether user is actively studying deck**

- **User Model**
  - Standard user information
  - Proficiency level (N5-N1 with CEFR approx)
  - Progress metrics
  - preferredTaskCategories: Array of preferred task types
  - completedTasks: Array of completed task IDs
  - currentTask: Currently active task (if any)
  - **studyPreferences: Study session preferences**
  - **dailyReviewLimit: Maximum reviews per day**
  - **newCardLimit: Maximum new cards per day**
  - **spacedRepetitionSettings: SRS algorithm parameters**
  - **studyStreak: Current study streak in days**
  - **totalStudyTime: Total time spent studying**
  - **totalReviews: Total number of card reviews**
  - isAdmin: Field for admin access control

- **TaskAttempt Model**
  - id: Unique identifier
  - userId: User who attempted the task
  - taskId: Task being attempted
  - startTime: When task was started
  - endTime: When task was completed
  - accuracyScore: Performance score
  - fluencyScore: Fluency assessment
  - completionScore: Overall completion score
  - feedback: AI-generated feedback
  - conversationHistory: Full conversation log
  - **vocabularyUsed: Array of vocabulary cards used**
  - **grammarUsed: Array of grammar cards used**
  - **missedOpportunities: Vocabulary that could have been used**
  - **newWordsEncountered: New vocabulary discovered during task**
  - isCompleted: Whether task was finished
  - retryCount: Number of retry attempts

- **Character Model**
  - Name and description
  - Personality traits
  - Speaking style
  - taskSpecific: Whether character is designed for specific tasks
  - assignedTasks: Array of task IDs where this character is used
  - isUserCreated: Field to distinguish between system and user-created characters
  - relationshipType: Field for free chat customization (secondary feature)

- **Conversation Model**
  - Chat history
  - Performance metrics
  - taskId: Associated task (if task-based conversation)
  - characterId: Character involved in conversation
  - conversationType: 'task-based' or 'free-chat'
  - **vocabularyHints: Vocabulary hints provided during conversation**
  - **cardsReviewed: Cards reviewed during conversation**
  - Timestamps

- **TaskCategory Model**
  - id: Unique identifier
  - name: Category name
  - description: Category description
  - icon: UI icon reference
  - sortOrder: Display order

- **AdminLog Model**
  - For tracking administrative actions
  - taskChanges: Specific field for task management actions
  - **deckChanges: Deck management actions**
  - **cardChanges: Card management actions**
  - actionType: Type of admin action (create, edit, delete task, etc.)

- **JLPTTest Model**
  - **id: Unique identifier**
  - **level: JLPT level (N1, N2, N3, N4, N5)**
  - **testType: Test type (full, section, timed, untimed)**
  - **sections: Array of test sections**
  - **totalQuestions: Total number of questions**
  - **estimatedDuration: Estimated completion time in minutes**
  - **passingCriteria: Pass marks and sectional requirements**
  - **isActive: Whether test is available to users**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**
  - **createdBy: Admin who created the test**
  - **version: Test version for tracking changes**

- **JLPTQuestion Model**
  - **id: Unique identifier**
  - **testId: Foreign key to JLPTTest**
  - **sectionName: Section name (Vocabulary, Grammar & Reading, Listening)**
  - **problemNumber: Problem number (問題1, 問題2, etc.)**
  - **questionNumber: Question number within problem**
  - **questionText: Question content**
  - **options: Array of answer options**
  - **correctAnswer: Correct answer option**
  - **explanation: Answer explanation**
  - **audioFile: Audio file path (for listening questions)**
  - **imageFile: Image file path (if applicable)**
  - **difficulty: Question difficulty level**
  - **tags: Array of tags for categorization**
  - **rawPoints: Raw points for this question**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**

- **JLPTAttempt Model**
  - **id: Unique identifier**
  - **userId: User who took the test**
  - **testId: Test being taken**
  - **level: JLPT level**
  - **testType: Type of test taken**
  - **startTime: Test start time**
  - **endTime: Test completion time**
  - **userAnswers: JSON object of user answers**
  - **rawScores: Raw scores per section**
  - **scaledScores: Scaled scores per section**
  - **totalScore: Total scaled score (0-180)**
  - **passed: Whether test was passed**
  - **sectionResults: Detailed section results**
  - **timeSpent: Total time spent on test**
  - **flaggedQuestions: Questions flagged for review**
  - **isCompleted: Whether test was finished**
  - **createdAt: Attempt timestamp**

- **JLPTAnswerKey Model**
  - **id: Unique identifier**
  - **level: JLPT level**
  - **problemNumber: Problem identifier**
  - **questionNumber: Question number**
  - **correctAnswer: Correct answer option**
  - **rawPointValue: Points awarded for correct answer**
  - **sectionName: Section this question belongs to**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**

- **UserSurvey Model**
  - **id: Unique identifier**
  - **userId: User who completed survey**
  - **backgroundInfo: Background information section**
    - **ageGroup: Age group (10代, 20代, 30代, 答えたくない)**
    - **gender: Gender (男性, 女性, 答えたくない)**
    - **occupation: Occupation (学生, 大学生, 日本語学校の学生, 社会人, パート・アルバイト, 技能実習生, 特定技能生, 留学生, その他)**
  - **learningPurpose: Learning purpose and goals**
    - **primaryPurpose: Primary learning purpose (日本で働くため, 日本の学校に入学するため, 日本人と話したいから, アニメ・マンガ・ドラマが好きだから, その他)**
    - **customPurpose: Custom purpose description (if other selected)**
  - **proficiencyAssessment: Current proficiency information**
    - **currentJLPTLevel: Current JLPT level (N5, N4, N3, N2, N1, わかりません)**
    - **learningDuration: Learning duration (1か月未満, 1−2か月間, 3−4か月間, 5−12月間, 一年以上)**
    - **speakingOpportunities: Speaking opportunities (授業, 家庭, 友達との会話, その他, 全く使わない)**
    - **speakingOpportunitiesOther: Other speaking opportunities description**
  - **technologyExperience: Previous app usage and experience**
    - **hasUsedJapaneseApps: Whether used Japanese learning apps (boolean)**
    - **appExperience: Array of apps used (Duolingo, Busuu, HelloTalk, Mazii, その他)**
    - **appExperienceOther: Other apps description**
    - **conversationPracticeFrequency: Frequency of conversation practice (よくする, ときどきする, あまりしない, 全くしない)**
  - **learningPreferences: Learning style and preferences**
    - **learningGoals: Array of learning objectives**
    - **learningStyle: Preferred learning style**
    - **timeAvailability: Daily study time and session preferences**
    - **difficultyPreference: Preference for gradual vs. challenging content**
  - **interestAssessment: Topics and motivation**
    - **topicInterests: Array of preferred topics**
    - **motivationFactors: Array of motivation factors**
    - **conversationScenarios: Preferred conversation types**
  - **technicalPreferences: Technical settings**
    - **voiceInteractionPreference: Voice vs. text preference**
    - **feedbackStyle: Detailed vs. concise feedback preference**
    - **progressTrackingPreference: Progress tracking preferences**
  - **surveyMetadata: Survey completion information**
    - **completedAt: Survey completion timestamp**
    - **isOnboardingComplete: Whether onboarding tutorial was completed**
    - **surveyVersion: Version of survey completed**
    - **completionTimeMinutes: Time taken to complete survey**
  - **privacyConsent: Privacy and data usage consent tracking**
    - **generalDataConsent: General data collection consent (required)**
    - **researchDataConsent: Consent for research usage (optional)**
    - **academicPartnershipConsent: Consent for academic partnership data sharing (optional)**
    - **analyticsConsent: Consent for analytics and improvement (optional)**
    - **consentTimestamp: When consent was given**
    - **consentVersion: Version of privacy policy consented to**
    - **ipAddress: IP address when consent was given (for legal compliance)**
    - **canWithdrawConsent: Whether user can withdraw consent**
    - **consentWithdrawnAt: Timestamp if consent was withdrawn**
  - **researchDataFlags: Research usage flags**
    - **isEligibleForResearch: Whether data can be used for research**
    - **anonymizedId: Anonymized identifier for research purposes**
    - **researchCategories: Array of research categories user consented to**
    - **dataRetentionPeriod: How long data will be retained for research**
    - **lastResearchUsage: Last time data was used for research**
  - **personalizedResults: Generated personalization data**
    - **personalizedRecommendations: Generated recommendations**
    - **initialDeckSubscriptions: Array of recommended deck IDs**
    - **difficultyLevelConfig: Initial difficulty configuration**
    - **learningPathSetup: Generated learning path**
    - **recommendedJLPTLevel: Recommended JLPT level to focus on**

- **UserPersonalization Model**
  - **id: Unique identifier**
  - **userId: User identifier**
  - **surveyId: Associated survey**
  - **currentProficiencyLevel: Current assessed level**
  - **recommendedJLPTLevel: Recommended JLPT level to focus on**
  - **preferredTaskCategories: Array of preferred task categories**
  - **adaptiveDifficultyEnabled: Whether adaptive difficulty is enabled**
  - **personalizedContentEnabled: Whether personalized content is enabled**
  - **learningPathProgress: Progress through generated learning path**
  - **lastRecommendationUpdate: Last time recommendations were updated**
  - **performanceMetrics: Aggregated performance data**
  - **createdAt: Creation timestamp**
  - **updatedAt: Last modification timestamp**

## 8. Development Approach

### System Development Plan

1. **Development Environment Setup**
   - Install core tools (Node.js, TypeScript, Docker, Git, PostgreSQL via Supabase)
   - Set up project repository with proper structure and configuration

2. **API Integrations**
   - Implement OpenAI API for language model access
   - Set up speech processing with Web Speech API and Whisper API
   - Implement text-to-speech services

3. **Database Implementation**
   - Define schema for users, characters, tasks, and conversations
   - **Implement flashcard system database models (Deck, Card, CardReview, StudySession)**
   - Set up Prisma ORM with TypeScript integration
   - Implement typed database access methods
   - **Create database migrations for flashcard system**

4. **Spaced Repetition System Development**
   - **Implement spaced repetition algorithm (SM-2 or similar)**
   - **Create card scheduling system**
   - **Develop review queue management**
   - **Implement ease factor calculations**
   - **Create study session tracking**

5. **Flashcard System Backend Development**
   - **Create deck management API endpoints**
   - **Implement card CRUD operations**
   - **Develop review session management**
   - **Create progress tracking systems**
   - **Implement deck import/export functionality**
   - **Add bulk operations for card management**

6. **Conversation Engine Development**
   - Define interfaces for conversation state management
   - Create prompt templates and communication with OpenAI API
   - Implement separate flows for task-based and free chat modes
   - Develop assessment metrics calculation
   - **Integrate flashcard system with conversation flow**
   - **Add vocabulary hint system**
   - **Implement post-conversation card updates**

7. **Backend API Development**
   - Set up Express.js with TypeScript
   - Implement authentication using Supabase
   - Create controllers for characters, tasks, conversations, and user profiles
   - **Add flashcard and deck management controllers**
   - **Implement study session management endpoints**
   - Develop admin-specific controllers and middleware
   - **Create analytics endpoints for study progress**

8. **Frontend Implementation**
   - Create Next.js application with TypeScript and Tailwind CSS
   - Implement UI components for conversation interfaces
   - Develop character creation and task selection interfaces
   - Create dashboard and progress visualization components
   - **Implement flashcard study interface**
   - **Create deck browser and management components**
   - **Add study session UI with rating system**
   - **Develop progress tracking visualizations**
   - **Integrate flashcard hints into conversation interface**

9. **Task-Deck Integration**
   - **Connect existing tasks to vocabulary and grammar decks**
   - **Implement pre-task study sessions**
   - **Add post-task review and card updates**
   - **Create vocabulary hint system for conversations**
   - **Develop task preparation workflows**

10. **Testing and Quality Assurance**
    - Implement Jest testing with TypeScript
    - Create unit and integration tests
    - **Add specific tests for spaced repetition algorithm**
    - **Test flashcard system performance**
    - Set up continuous integration workflows

11. **Deployment Configuration**
    - Configure Docker for development
    - Set up Railway deployment
    - Implement continuous deployment with GitHub Actions
    - **Configure database migrations for production**

12. **JLPT Tryout System Development**
    - **Implement JLPT scoring algorithm (SM-2 based)**
    - **Create test content management system**
    - **Develop question bank and answer key management**
    - **Build test execution engine with timer functionality**
    - **Implement score calculation and scaling system**
    - **Create test analytics and performance tracking**
    - **Develop test history and progress visualization**
    - **Add audio and media support for listening sections**

13. **User Survey System Development**
    - **Design proficiency assessment algorithms**
    - **Create personalization recommendation engine**
    - **Implement survey flow management**
    - **Build onboarding tutorial system**
    - **Develop learning path generation logic**
    - **Create user preference tracking system**
    - **Implement adaptive difficulty adjustment**
    - **Add survey analytics and reporting**

14. **Integration and Advanced Features**
    - **Integrate JLPT results with personalized learning recommendations**
    - **Connect survey data to conversation AI personalization**
    - **Implement cross-feature progress tracking**
    - **Add predictive analytics for learning outcomes**
    - **Create comprehensive user dashboard**
    - **Integrate all features into unified user experience**

## 9. Anki-like Flashcard System Implementation

### Core Features

#### Spaced Repetition Algorithm

The system implements a modified SM-2 (SuperMemo 2) algorithm with the following characteristics:

**Initial Parameters:**

- **Ease Factor**: Starting at 2.5 for new cards
- **Interval**: 1 day for first review, 6 days for second review
- **Repetitions**: Counter for successful reviews

**Rating System:**

- **1 (Again)**: Card forgotten, reset to learning phase
- **2 (Hard)**: Difficult but remembered, reduce ease factor
- **3 (Good)**: Standard recall, normal interval increase
- **4 (Easy)**: Very easy recall, bonus interval and ease increase

**Algorithm Implementation:**

```typescript
interface CardSchedule {
  ease: number; // Ease factor (1.3-4.0)
  interval: number; // Days until next review
  repetitions: number; // Successful repetitions
  lapses: number; // Number of failures
  nextReview: Date; // Next review date
}

function calculateNextReview(rating: number, currentSchedule: CardSchedule): CardSchedule {
  // Implementation follows SM-2 algorithm with modifications
  // for Japanese language learning optimization
}
```

#### Card Types and Templates

**Vocabulary Cards:**

- **Front**: Japanese word/phrase (with optional audio)
- **Back**: English translation, reading, example sentence
- **Additional**: Part of speech, difficulty level, usage notes

**Grammar Cards:**

- **Front**: Grammar point explanation or example
- **Back**: Usage rules, example sentences, common mistakes
- **Additional**: JLPT level, related grammar points

**Kanji Cards:**

- **Front**: Individual kanji character
- **Back**: Readings (on'yomi, kun'yomi), meanings, stroke order
- **Additional**: Vocabulary using the kanji, mnemonics

**Sentence Cards:**

- **Front**: Japanese sentence with missing word/grammar
- **Back**: Complete sentence with explanation
- **Additional**: Context, difficulty level, related vocabulary

#### Task Integration Patterns

**Pre-Task Study:**

1. System analyzes task requirements
2. Identifies relevant vocabulary and grammar cards
3. Presents focused study session (5-10 minutes)
4. User studies key cards before starting conversation
5. Cards are marked as "recently studied" for hint system

**During-Task Integration:**

1. **Vocabulary Hints**: Real-time suggestions from studied cards
2. **Context Awareness**: AI incorporates studied vocabulary into responses
3. **Usage Tracking**: System tracks which cards were actually used
4. **Missed Opportunities**: Identifies vocabulary that could have been used

**Post-Task Review:**

1. **Performance Analysis**: Evaluate vocabulary usage effectiveness
2. **Card Updates**: Adjust ease factors based on real-world usage
3. **New Cards**: Add encountered vocabulary to user's deck
4. **Review Queue**: Schedule follow-up reviews for used cards

#### Study Session Management

**Session Types:**

- **Daily Reviews**: Due cards based on spaced repetition schedule
- **New Cards**: Introduction of new vocabulary/grammar
- **Cram Sessions**: Intensive review before tasks
- **Task Preparation**: Targeted study for specific tasks

**Session Flow:**

1. **Queue Generation**: Create study queue based on due cards and limits
2. **Card Presentation**: Display front of card with audio/visual aids
3. **User Response**: User attempts recall (timed or untimed)
4. **Answer Reveal**: Show back of card with full information
5. **Rating Collection**: User rates difficulty (1-4 scale)
6. **Schedule Update**: Calculate next review date using algorithm
7. **Progress Tracking**: Update session and overall statistics

#### Integration with Conversation System

**Hint System:**

- **Contextual Vocabulary**: Suggest relevant cards during conversation
- **Grammar Assistance**: Provide grammar point reminders
- **Progressive Disclosure**: Start with hints, reveal answers if needed
- **Usage Confirmation**: Track successful application of hints

**AI Integration:**

- **Vocabulary Seeding**: AI uses studied vocabulary in responses
- **Difficulty Adjustment**: AI adapts complexity based on studied cards
- **Natural Integration**: Seamless incorporation without breaking flow
- **Learning Reinforcement**: AI reinforces correct usage patterns

### Technical Implementation

#### Database Design Considerations

**Performance Optimization:**

- **Indexed Queries**: Efficient lookup of due cards and user progress
- **Denormalized Data**: Strategic duplication for faster read operations
- **Caching Strategy**: Redis caching for frequently accessed data
- **Batch Operations**: Bulk updates for review sessions

**Data Relationships:**

- **User-Deck Subscriptions**: Many-to-many with progress tracking
- **Task-Deck Associations**: Pre-defined curriculum connections
- **Card-Review History**: Complete audit trail of learning progress
- **Session-Card Tracking**: Detailed session analytics

#### API Design

**RESTful Endpoints:**

```
GET /api/study/due-cards          # Get cards due for review
POST /api/study/review-card       # Submit card review
GET /api/study/decks              # Browse available decks
POST /api/study/start-session     # Start new study session
GET /api/study/progress           # Get user progress statistics
```

**Real-time Features:**

- **WebSocket Connections**: Live updates during study sessions
- **Progress Synchronization**: Cross-device progress sync
- **Hint Delivery**: Real-time vocabulary hints during conversations

#### Frontend Components

**Study Interface:**

- **Card Display**: Clean, distraction-free card presentation
- **Audio Controls**: Integrated audio playback for Japanese content
- **Progress Indicators**: Visual feedback on session progress
- **Keyboard Shortcuts**: Efficient navigation for power users

**Deck Management:**

- **Deck Browser**: Filter, search, and preview decks
- **Subscription Management**: Subscribe/unsubscribe from decks
- **Custom Decks**: Create and manage personal flashcard decks
- **Import/Export**: Standard format compatibility (Anki, CSV)

**Analytics Dashboard:**

- **Study Statistics**: Visual progress tracking and trends
- **Performance Metrics**: Success rates, response times, difficulty analysis
- **Calendar View**: Study consistency and streak tracking
- **Comparative Analysis**: Performance across different card types

### Quality Assurance

#### Testing Strategy

**Algorithm Testing:**

- **Unit Tests**: Verify spaced repetition calculations
- **Performance Tests**: Ensure efficient card scheduling
- **Edge Case Testing**: Handle unusual user behaviors
- **A/B Testing**: Compare different algorithm parameters

**Integration Testing:**

- **Task-Deck Integration**: Verify seamless workflow
- **Conversation Hints**: Test real-time hint delivery
- **Cross-Platform**: Ensure consistent experience across devices
- **Data Integrity**: Validate progress tracking accuracy

#### Performance Monitoring

**Key Metrics:**

- **Response Times**: Card loading and review submission speed
- **Memory Usage**: Efficient handling of large card collections
- **Database Performance**: Query optimization and indexing
- **User Engagement**: Study session completion rates

**Error Handling:**

- **Network Failures**: Graceful degradation for offline use
- **Data Corruption**: Recovery mechanisms for corrupted progress
- **Sync Conflicts**: Resolution of cross-device synchronization issues
- **Algorithm Failures**: Fallback mechanisms for calculation errors

## 10. JLPT Tryout System Implementation

### Core Features

#### JLPT Scoring Algorithm Implementation

The system implements the official JLPT scoring methodology with the following characteristics:

**Section Organization by Level:**

- **N5 & N4**: Two-section model (Language Knowledge + Listening)
- **N3, N2 & N1**: Three-section model (Vocabulary + Grammar & Reading + Listening)

**Score Calculation Process:**

```typescript
interface JLPTScoreResult {
  level: string;
  rawScores: { [sectionName: string]: { [problemNumber: string]: number } };
  scaledScores: { [sectionName: string]: number };
  totalScore: number;
  passed: boolean;
  sectionResults: { [sectionName: string]: { score: number; passed: boolean } };
}

function calculateJLPTScore(level: string, userAnswers: any): JLPTScoreResult {
  // Raw score calculation for each section
  // Scaled score conversion (0-60 per section, 0-180 total)
  // Pass/fail determination based on sectional and overall requirements
}
```

**Passing Criteria:**

- **Overall Pass Mark**: Minimum total score required
- **Sectional Pass Marks**: Minimum score required for each section
- **Dual Requirement**: Must pass both overall and all sectional requirements

#### Test Content Management

**Question Types:**

- **Multiple Choice**: Standard 4-option questions
- **Audio Questions**: Listening comprehension with audio playback
- **Reading Comprehension**: Text-based questions with passages
- **Grammar Points**: Specific grammar pattern questions

**Content Structure:**

```typescript
interface JLPTQuestion {
  id: string;
  testId: string;
  sectionName: string;
  problemNumber: string;
  questionNumber: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioFile?: string;
  imageFile?: string;
  difficulty: number;
  rawPoints: number;
}
```

#### Test Execution Engine

**Test Flow Management:**

1. **Pre-test Setup**: Instructions, audio check, system verification
2. **Section Navigation**: Progressive section completion
3. **Question Presentation**: Clean interface with answer selection
4. **Timer Management**: Real-time countdown for timed tests
5. **Review System**: Flag questions for review, navigate within sections
6. **Submission Process**: Section-by-section submission with confirmation

**Timer Implementation:**

```typescript
interface TestTimer {
  totalTime: number; // Total test duration
  sectionTimes: number[]; // Time per section
  currentSection: number; // Active section
  timeRemaining: number; // Current remaining time
  isActive: boolean; // Timer state
  warnings: number[]; // Warning thresholds
}
```

#### Performance Analytics

**Individual Performance Tracking:**

- **Score Progression**: Track improvement over multiple attempts
- **Section Analysis**: Identify strengths and weaknesses
- **Question-Level Analytics**: Detailed breakdown of performance
- **Time Management**: Analyze time spent per section and question

**Comparative Analysis:**

- **Percentile Ranking**: Compare with other users at same level
- **Difficulty Calibration**: Adjust question difficulty based on performance
- **Success Predictors**: Identify factors that correlate with success

#### Integration with Learning System

**Personalized Recommendations:**

- **Targeted Study Plans**: Based on JLPT performance gaps
- **Deck Recommendations**: Suggest relevant flashcard decks
- **Task Prioritization**: Recommend conversation tasks based on weak areas
- **Progressive Difficulty**: Adjust difficulty based on test performance

**Learning Path Adaptation:**

- **Dynamic Content**: Adjust conversation AI based on JLPT results
- **Vocabulary Integration**: Prioritize vocabulary from missed questions
- **Grammar Focus**: Emphasize grammar points from weak areas
- **Progress Correlation**: Link JLPT improvement to other learning activities

### Technical Implementation

#### Database Design

**Test Management Tables:**

```sql
-- Test definitions and configurations
CREATE TABLE jlpt_tests (
  id SERIAL PRIMARY KEY,
  level VARCHAR(2) NOT NULL,
  test_type VARCHAR(20) NOT NULL,
  sections JSONB NOT NULL,
  total_questions INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  passing_criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question bank
CREATE TABLE jlpt_questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES jlpt_tests(id),
  section_name VARCHAR(50) NOT NULL,
  problem_number VARCHAR(10) NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  explanation TEXT,
  audio_file VARCHAR(255),
  image_file VARCHAR(255),
  difficulty INTEGER NOT NULL,
  raw_points INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User test attempts
CREATE TABLE jlpt_attempts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  test_id INTEGER REFERENCES jlpt_tests(id),
  level VARCHAR(2) NOT NULL,
  test_type VARCHAR(20) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  user_answers JSONB,
  raw_scores JSONB,
  scaled_scores JSONB,
  total_score INTEGER,
  passed BOOLEAN,
  section_results JSONB,
  time_spent INTEGER,
  flagged_questions JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

**Test Management:**

```typescript
// Test execution endpoints
POST /api/jlpt/start-test          // Initialize test session
GET /api/jlpt/test/:id/questions   // Get test questions
POST /api/jlpt/submit-answer       // Submit individual answer
POST /api/jlpt/submit-section      // Submit section
POST /api/jlpt/complete-test       // Complete and score test

// Results and analytics
GET /api/jlpt/results/:attemptId   // Get test results
GET /api/jlpt/history             // User test history
GET /api/jlpt/analytics           // Performance analytics
POST /api/jlpt/calculate-score    // Score calculation
```

**Real-time Features:**

- **Auto-save**: Periodic saving of user answers
- **Timer Synchronization**: Real-time timer updates
- **Progress Tracking**: Live progress indicators
- **Warning System**: Time-based warnings and alerts

#### Frontend Components

**Test Interface:**

```jsx
// Main test interface component
const JLPTTestInterface = ({ testId, level }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timer, setTimer] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);

  return (
    <div className="jlpt-test-interface">
      <TestHeader level={level} timer={timer} />
      <ProgressIndicator sections={sections} currentSection={currentSection} />
      <QuestionDisplay
        question={currentQuestion}
        userAnswer={userAnswers[currentQuestion.id]}
        onAnswerSelect={handleAnswerSelect}
        onFlag={handleFlag}
        isFlagged={flaggedQuestions.includes(currentQuestion.id)}
      />
      <NavigationControls
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSubmitSection={handleSubmitSection}
      />
    </div>
  );
};
```

**Results Dashboard:**

```jsx
// Test results display component
const JLPTResultsDisplay = ({ attemptId }) => {
  const [results, setResults] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  return (
    <div className="jlpt-results-display">
      <OverallScoreCard
        totalScore={results.totalScore}
        passed={results.passed}
        level={results.level}
      />
      <SectionBreakdown sections={results.sectionResults} passingMarks={results.passingCriteria} />
      <PerformanceAnalysis
        strengths={results.analysis.strengths}
        weaknesses={results.analysis.weaknesses}
        recommendations={results.recommendations}
      />
      <AnswerReview
        questions={results.questions}
        userAnswers={results.userAnswers}
        explanations={results.explanations}
      />
    </div>
  );
};
```

## 11. User Survey System Implementation

### Core Features

#### Proficiency Assessment Engine

The system implements a comprehensive proficiency assessment that combines self-assessment with analytical evaluation:

**Assessment Components:**

- **Self-Assessment**: User's subjective evaluation of their current level
- **JLPT Experience**: Previous test attempts and results
- **Learning Background**: Duration, intensity, and methods used
- **Skills Evaluation**: Separate assessment for speaking, listening, reading, writing

**Proficiency Calculation:**

```typescript
interface ProficiencyAssessment {
  overallLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  jlptEquivalent: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Pre-N5';
  skillBreakdown: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  confidence: number; // Confidence score in assessment
  recommendedStartingLevel: string;
}
```

#### Personalization Engine

The system creates detailed user profiles to customize the learning experience:

**Learning Style Analysis:**

- **Visual Learners**: Emphasis on text, images, and visual cues
- **Auditory Learners**: Focus on audio content and speech practice
- **Kinesthetic Learners**: Interactive elements and hands-on practice
- **Reading/Writing Learners**: Text-based exercises and written practice

**Preference Mapping:**

```typescript
interface UserPreferences {
  learningGoals: string[];
  studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  timeAvailability: {
    dailyMinutes: number;
    preferredSessionLength: number;
    consistentSchedule: boolean;
  };
  difficultyPreference: 'gradual' | 'challenging' | 'adaptive';
  motivationFactors: string[];
  topicInterests: string[];
}
```

#### Recommendation System

Based on survey responses, the system generates personalized recommendations:

**Learning Path Generation:**

- **Skill Prioritization**: Focus areas based on goals and current level
- **Content Recommendations**: Suggested tasks, decks, and conversation topics
- **Difficulty Progression**: Customized difficulty curve
- **Study Schedule**: Optimal timing and frequency suggestions

**Adaptive Configuration:**

```typescript
interface PersonalizedConfiguration {
  initialDecks: string[]; // Recommended flashcard decks
  taskCategories: string[]; // Preferred conversation scenarios
  difficultyLevel: number; // Starting difficulty setting
  aiPersonality: string; // Preferred AI interaction style
  feedbackStyle: 'detailed' | 'concise' | 'encouraging';
  progressTracking: boolean; // Enable/disable progress tracking
}
```

#### Onboarding System

Comprehensive tutorial system to introduce users to the platform:

**Tutorial Modules:**

1. **Feature Overview**: Introduction to all main features
2. **Navigation Tutorial**: How to use the interface effectively
3. **First Conversation**: Guided first chat experience
4. **Flashcard Introduction**: How to use the spaced repetition system
5. **Progress Tracking**: Understanding analytics and progress

**Interactive Guidance:**

- **Step-by-step Walkthrough**: Progressive feature introduction
- **Practice Exercises**: Hands-on experience with key features
- **Help System**: Contextual help and tooltips
- **Quick Reference**: Accessible guide for feature reminders

### Technical Implementation

#### Survey Flow Management

**Multi-step Survey Architecture:**

```typescript
interface SurveyStep {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  validation: ValidationRule[];
  nextStepLogic: (responses: any) => string;
}

interface SurveyQuestion {
  id: string;
  type: 'multiple-choice' | 'scale' | 'multi-select' | 'text' | 'slider';
  question: string;
  options?: string[];
  required: boolean;
  validation?: ValidationRule[];
  conditionalLogic?: ConditionalRule[];
}

// Specific Survey Step Implementations
interface BackgroundInfoStep extends SurveyStep {
  questions: [
    {
      id: 'ageGroup';
      type: 'multiple-choice';
      question: '年代を選択してください';
      options: ['10代', '20代', '30代', '答えたくない'];
      required: true;
    },
    {
      id: 'gender';
      type: 'multiple-choice';
      question: '性別を選択してください';
      options: ['男性', '女性', '答えたくない'];
      required: true;
    },
    {
      id: 'occupation';
      type: 'multiple-choice';
      question: '職業を選択してください';
      options: [
        '学生',
        '大学生',
        '日本語学校の学生',
        '社会人',
        'パート・アルバイト',
        '技能実習生',
        '特定技能生',
        '留学生',
        'その他',
      ];
      required: true;
    },
  ];
}

interface LearningPurposeStep extends SurveyStep {
  questions: [
    {
      id: 'primaryPurpose';
      type: 'multiple-choice';
      question: '日本語を学ぶ目的を選択してください';
      options: [
        '日本で働くため',
        '日本の学校に入学するため',
        '日本人と話したいから',
        'アニメ・マンガ・ドラマが好きだから',
        'その他',
      ];
      required: true;
    },
    {
      id: 'customPurpose';
      type: 'text';
      question: 'その他の目的を具体的に教えてください';
      required: false;
      conditionalLogic: [{ dependsOn: 'primaryPurpose'; showIf: 'その他' }];
    },
  ];
}

interface ProficiencyAssessmentStep extends SurveyStep {
  questions: [
    {
      id: 'currentJLPTLevel';
      type: 'multiple-choice';
      question: '現在の日本語レベルを選択してください';
      options: ['N5', 'N4', 'N3', 'N2', 'N1', 'わかりません'];
      required: true;
    },
    {
      id: 'learningDuration';
      type: 'multiple-choice';
      question: '日本語学習歴を選択してください';
      options: ['1か月未満', '1−2か月間', '3−4か月間', '5−12月間', '一年以上'];
      required: true;
    },
    {
      id: 'speakingOpportunities';
      type: 'multi-select';
      question: '日本語を話す機会を選択してください（複数選択可）';
      options: ['授業', '家庭', '友達との会話', 'その他', '全く使わない'];
      required: true;
    },
  ];
}

interface TechnologyExperienceStep extends SurveyStep {
  questions: [
    {
      id: 'hasUsedJapaneseApps';
      type: 'multiple-choice';
      question: '日本語学習アプリを使ったことがありますか';
      options: ['はい', 'いいえ'];
      required: true;
    },
    {
      id: 'appExperience';
      type: 'multi-select';
      question: 'どんなアプリを使ったことがありますか（複数選択可）';
      options: ['Duolingo', 'Busuu', 'HelloTalk', 'Mazii', 'その他'];
      required: false;
      conditionalLogic: [{ dependsOn: 'hasUsedJapaneseApps'; showIf: 'はい' }];
    },
    {
      id: 'conversationPracticeFrequency';
      type: 'multiple-choice';
      question: 'そのアプリで、会話（話す・聞く）の練習をしますか';
      options: ['よくする', 'ときどきする', 'あまりしない', '全くしない'];
      required: false;
      conditionalLogic: [{ dependsOn: 'hasUsedJapaneseApps'; showIf: 'はい' }];
    },
  ];
}

// Complete Survey Response Interface
interface CompleteSurveyResponse {
  backgroundInfo: {
    ageGroup: string;
    gender: string;
    occupation: string;
  };
  learningPurpose: {
    primaryPurpose: string;
    customPurpose?: string;
  };
  proficiencyAssessment: {
    currentJLPTLevel: string;
    learningDuration: string;
    speakingOpportunities: string[];
  };
  technologyExperience: {
    hasUsedJapaneseApps: boolean;
    appExperience: string[];
    conversationPracticeFrequency: string;
  };
  learningPreferences: {
    learningGoals: string[];
    learningStyle: string;
    timeAvailability: {
      dailyMinutes: number;
      preferredSessionLength: number;
    };
    difficultyPreference: string;
  };
  interestAssessment: {
    topicInterests: string[];
    motivationFactors: string[];
    conversationScenarios: string[];
  };
  technicalPreferences: {
    voiceInteractionPreference: string;
    feedbackStyle: string;
    progressTrackingPreference: string;
  };
}
```

**Progress Tracking:**

- **Completion Percentage**: Real-time progress indicator
- **Save and Resume**: Ability to complete survey over multiple sessions
- **Validation System**: Ensure data quality and completeness
- **Branching Logic**: Adaptive questions based on previous responses

#### Database Design

**Survey Management Tables:**

```sql
-- Survey definitions and configurations
CREATE TABLE surveys (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(10) NOT NULL,
  steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User survey responses
CREATE TABLE user_surveys (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  survey_id INTEGER REFERENCES surveys(id),
  responses JSONB NOT NULL,
  proficiency_assessment JSONB,
  personalized_config JSONB,
  completed_at TIMESTAMP,
  is_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personalization profiles
CREATE TABLE user_personalization (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  survey_id INTEGER REFERENCES user_surveys(id),
  learning_profile JSONB NOT NULL,
  recommendations JSONB,
  adaptive_settings JSONB,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

**Survey Management:**

```typescript
// Survey execution endpoints
GET /api/survey/current           // Get current survey configuration
POST /api/survey/start           // Start new survey session
POST /api/survey/submit-step     // Submit individual step
GET /api/survey/progress         // Get survey progress
POST /api/survey/complete        // Complete survey

// Personalization endpoints
GET /api/personalization/profile    // Get user profile
POST /api/personalization/update   // Update preferences
GET /api/personalization/recommendations // Get recommendations
POST /api/personalization/feedback     // Submit feedback on recommendations

// Research consent management endpoints
POST /api/survey/consent            // Submit privacy consent choices
GET /api/survey/consent/:userId     // Get user consent status
PUT /api/survey/consent/:userId     // Update consent preferences
DELETE /api/survey/consent/:userId  // Withdraw consent
GET /api/survey/privacy-policy      // Get current privacy policy
POST /api/research/anonymize        // Generate anonymized research data
GET /api/research/eligible-users    // Get users eligible for research (admin only)
```

**Real-time Features:**

- **Auto-save**: Periodic saving of survey responses
- **Progress Sync**: Cross-device progress synchronization
- **Adaptive Questions**: Dynamic question loading based on responses
- **Validation Feedback**: Real-time input validation

#### Frontend Components

**Survey Interface:**

```jsx
// Multi-step survey component
const SurveyInterface = ({ surveyId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="survey-interface">
      <SurveyHeader
        title={currentStepData.title}
        progress={progress}
        step={currentStep + 1}
        totalSteps={totalSteps}
      />
      <StepContent
        step={currentStepData}
        responses={responses}
        onResponseChange={handleResponseChange}
        validation={validationErrors}
      />
      <NavigationControls
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={handleSave}
        canProceed={isStepValid}
        isLoading={isLoading}
      />
    </div>
  );
};
```

**Personalization Dashboard:**

```jsx
// User personalization display
const PersonalizationDashboard = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [settings, setSettings] = useState({});

  return (
    <div className="personalization-dashboard">
      <ProfileSummary
        proficiencyLevel={profile.proficiencyLevel}
        learningGoals={profile.learningGoals}
        studyStyle={profile.studyStyle}
      />
      <RecommendationsList
        recommendations={recommendations}
        onAccept={handleAcceptRecommendation}
        onReject={handleRejectRecommendation}
      />
      <AdaptiveSettings settings={settings} onUpdate={handleUpdateSettings} />
      <LearningPathVisualization path={profile.learningPath} progress={profile.progress} />
    </div>
  );
};
```

#### Integration with Learning System

**Conversation AI Personalization:**

- **Personality Adaptation**: AI adjusts communication style based on preferences
- **Topic Selection**: Prioritize conversation topics based on interests
- **Difficulty Adjustment**: Real-time difficulty adaptation based on performance
- **Feedback Style**: Customize feedback delivery based on preferences

**Content Personalization:**

- **Deck Recommendations**: Suggest relevant flashcard decks
- **Task Prioritization**: Recommend conversation tasks based on goals
- **Progress Tracking**: Customize progress visualization and reporting
- **Motivation System**: Personalized encouragement and reward systems

**Adaptive Learning:**

- **Performance Analysis**: Continuous assessment of learning effectiveness
- **Recommendation Updates**: Regular updates to recommendations based on progress
- **Goal Adjustment**: Modify learning goals based on achievement patterns
- **Intervention Systems**: Identify and address learning challenges

### Quality Assurance

#### Testing Strategy

**Survey System Testing:**

- **Flow Testing**: Verify all survey paths and branching logic
- **Validation Testing**: Ensure data validation works correctly
- **Performance Testing**: Test with large numbers of concurrent users
- **Accessibility Testing**: Ensure survey is accessible to all users

**Personalization Testing:**

- **Algorithm Testing**: Verify recommendation accuracy
- **A/B Testing**: Compare different personalization approaches
- **Longitudinal Testing**: Track personalization effectiveness over time
- **User Feedback**: Collect and analyze user satisfaction with recommendations

#### Performance Monitoring

**Key Metrics:**

- **Survey Completion Rate**: Percentage of users completing survey
- **Response Quality**: Assess completeness and consistency of responses
- **Personalization Accuracy**: Measure recommendation relevance
- **User Satisfaction**: Track user satisfaction with personalized experience

**Continuous Improvement:**

- **Response Analysis**: Analyze survey responses for insights
- **Recommendation Optimization**: Improve recommendation algorithms
- **User Behavior Tracking**: Monitor how users interact with personalized content
- **Feedback Integration**: Incorporate user feedback into system improvements

### Quality Assurance

#### Research Data Management

**Consent Management System:**
The application implements a comprehensive consent management system that allows users to control how their data is used for research purposes:

**Consent Types:**

- **General Data Collection**: Required for basic app functionality
- **Research Usage**: Optional consent for using anonymized data in research studies
- **Academic Partnerships**: Optional consent for sharing data with educational institutions
- **Analytics and Improvement**: Optional consent for using data to improve the application

**Data Anonymization Process:**

```typescript
interface AnonymizedUserData {
  anonymizedId: string; // UUID replacing user ID
  demographics: {
    ageGroup: string;
    occupation: string;
    // Gender removed for additional privacy
  };
  learningData: {
    jlptLevel: string;
    learningDuration: string;
    studyPatterns: any[];
  };
  performanceData: {
    conversationScores: number[];
    jlptTestResults: any[];
    studyProgress: any[];
  };
  excludedFields: string[]; // Fields removed during anonymization
  anonymizedAt: Date;
  researchCategories: string[];
}

function anonymizeUserData(userData: CompleteSurveyResponse): AnonymizedUserData {
  // Remove all personally identifiable information
  // Replace user ID with anonymous identifier
  // Remove location, IP address, and other sensitive data
  // Aggregate performance data to prevent re-identification
  // Return anonymized dataset suitable for research
}
```

**Research Data Usage Guidelines:**

- **Academic Research**: Support language learning methodology studies
- **Educational Insights**: Improve Japanese language teaching approaches
- **User Experience Research**: Enhance app effectiveness and usability
- **Longitudinal Studies**: Track learning progress patterns over time

**Privacy Protection Measures:**

- **Data Minimization**: Only collect data necessary for research purposes
- **Consent Granularity**: Users can choose specific research categories
- **Right to Withdraw**: Users can withdraw consent at any time
- **Data Retention Limits**: Research data automatically deleted after specified period
- **Audit Trails**: Complete logging of data access and usage
- **Ethical Review**: All research proposals reviewed by ethics committee

**Compliance and Security:**

- **GDPR Compliance**: Full compliance with European data protection regulations
- **Data Processing Agreements**: Formal agreements with research partners
- **Security Measures**: Encrypted storage and transmission of research data
- **Access Controls**: Role-based access to research datasets
- **Regular Audits**: Periodic review of data usage and consent compliance

#### Testing Strategy

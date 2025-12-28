# Database Design - JLPT Tryout Application (v2 - Simplified)

**Version**: 2.0
**Last Updated**: 2025-12-28
**Changes**: Removed over-engineering, simplified schema, deferred premature optimizations
**Related Documents**: [Test Level Details](./02-test-level-details.md), [Scoring Calculation](./03-scoring-calculation.md)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Core Database Entities](#2-core-database-entities)
   - 2.1 [User Management](#21-user-management)
   - 2.2 [Configuration](#22-configuration)
   - 2.3 [Content Management](#23-content-management)
   - 2.4 [Test Management](#24-test-management)
   - 2.5 [Offline Calculator](#25-offline-calculator)
3. [Analytics](#3-analytics)
4. [Entity Relationship Diagram](#4-entity-relationship-diagram)
5. [Indexing Strategy](#5-indexing-strategy)
6. [Data Integrity & Validation](#6-data-integrity--validation)

---

## 1. Design Philosophy

### Core Principles

- **Start Simple**: MVP-first approach, add complexity only when proven necessary
- **Single Source of Truth**: No duplicate or derived data in core tables
- **Configuration as Code**: Static reference data lives in application config
- **Defer Analytics**: Calculate on-demand until performance requires optimization

### What We Removed

- ❌ `question_pools` table (redundant counts)
- ❌ `generated_tests` + `generated_test_questions` (over-complicated)
- ❌ `session_choice_orders` table (use deterministic shuffling)
- ❌ 6 analytics tables (defer to Phase 2)
- ❌ `question_context` field (deprecated)
- ❌ `mondai_weights` table (moved to config)

---

## 2. Core Database Entities

### 2.1 User Management

#### **Users** (from Gengobot App)

Existing user authentication and profile management.

---

### 2.2 Configuration

#### **Mondai Weights** (Application Config)

**Moved to**: `src/config/jlpt-mondai.ts`

```typescript
// src/config/jlpt-mondai.ts
export const MONDAI_CONFIG = {
  N5: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 12 },
        { number: 2, weight: 1, questions_count: 8 },
        { number: 3, weight: 1, questions_count: 10 },
        { number: 4, weight: 1, questions_count: 5 },
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 1, weight: 1, questions_count: 16 },
        { number: 2, weight: 1, questions_count: 5 },
        { number: 3, weight: 1, questions_count: 5 },
        { number: 4, weight: 4, questions_count: 3 },
        { number: 5, weight: 4, questions_count: 2 },
        { number: 6, weight: 4, questions_count: 1 },
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 7 },
        { number: 2, weight: 2.5, questions_count: 6 },
        { number: 3, weight: 3, questions_count: 5 },
        { number: 4, weight: 2.5, questions_count: 6 },
      ],
    },
  },
  // ... N4, N3, N2, N1
} as const;

// Type-safe helper functions
export function getMondaiWeight(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): number {
  const mondai = MONDAI_CONFIG[level][section].mondai.find(m => m.number === mondaiNumber);
  if (!mondai) throw new Error(`Invalid mondai: ${level} ${section} ${mondaiNumber}`);
  return mondai.weight;
}

export function getQuestionsPerMondai(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): number {
  const mondai = MONDAI_CONFIG[level][section].mondai.find(m => m.number === mondaiNumber);
  if (!mondai) throw new Error(`Invalid mondai: ${level} ${section} ${mondaiNumber}`);
  return mondai.questions_count;
}
```

**Benefits**:

- ✅ Type-safe at compile time
- ✅ No DB migrations for config changes
- ✅ Fast lookups (in-memory)
- ✅ Version controlled with code

#### **Scoring Configuration**

Level-specific scoring rules and thresholds.

```sql
CREATE TABLE scoring_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(2) NOT NULL CHECK (level IN ('N1','N2','N3','N4','N5')),
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),
  raw_max_score DECIMAL(5,2) NOT NULL, -- 35, 45, 50, 59, 62, 64
  overall_passing_score INTEGER NOT NULL, -- 80, 90, 95, 100
  section_passing_score INTEGER NOT NULL, -- 19 or 38
  has_dual_normalization BOOLEAN DEFAULT false, -- N3 Section 2 only
  combined_with_section VARCHAR(20), -- For N4/N5 combined sections

  UNIQUE(level, section_type)
);

CREATE INDEX idx_scoring_configs_lookup
ON scoring_configs(level, section_type);
```

---

### 2.3 Content Management

#### **Passages**

Simplified content storage (text, audio, images) for grouped questions.

```sql
CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('text', 'audio', 'image')),
  content_text TEXT, -- For reading passages, cloze tests
  media_url VARCHAR(500), -- CDN URL for audio/images
  title TEXT, -- Mondai instructions/title
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- Ensure either text or media is provided
  CONSTRAINT chk_content_provided
    CHECK (content_text IS NOT NULL OR media_url IS NOT NULL)
);

CREATE INDEX idx_passages_active ON passages(is_active);
```

**Usage Examples**:

- **Text Passage**: `content_type='text'`, `content_text='長文...'`, `media_url=null`
- **Audio File**: `content_type='audio'`, `content_text=null`, `media_url='https://cdn.../audio.mp3'`
- **Infographic**: `content_type='image'`, `content_text=null`, `media_url='https://cdn.../chart.png'`

#### **Questions**

Individual question records.

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,

  -- JLPT Structure
  level VARCHAR(2) NOT NULL CHECK (level IN ('N1','N2','N3','N4','N5')),
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),
  mondai_number INTEGER NOT NULL CHECK (mondai_number BETWEEN 1 AND 20),
  question_number INTEGER NOT NULL, -- Order within passage/unit (1, 2, 3...)

  -- Question Content
  question_text TEXT NOT NULL,
  blank_position VARCHAR(10), -- For cloze tests: "41", "42", etc.
  question_type VARCHAR(20) DEFAULT 'standard' CHECK (
    question_type IN ('standard', 'cloze', 'comparison', 'graphic')
  ),

  -- Standalone Media (for individual questions, not passages)
  media_url VARCHAR(500),
  media_type VARCHAR(10) CHECK (media_type IN ('audio', 'image')),

  -- Answer & Quality
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
  difficulty_level VARCHAR(10) DEFAULT 'medium' CHECK (
    difficulty_level IN ('easy', 'medium', 'hard')
  ),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- Ensure mondai exists in config
  CONSTRAINT chk_valid_mondai CHECK (
    -- Validation happens in application layer using MONDAI_CONFIG
    mondai_number > 0
  )
);

-- Performance indexes
CREATE INDEX idx_questions_lookup
ON questions(level, section_type, mondai_number, is_active);

CREATE INDEX idx_questions_passage
ON questions(passage_id, question_number)
WHERE passage_id IS NOT NULL;

CREATE INDEX idx_questions_difficulty
ON questions(level, section_type, difficulty_level, is_active);
```

**Key Changes**:

- ✅ Removed `question_context` (deprecated)
- ✅ Removed `times_used`, `success_rate` (moved to analytics)
- ✅ Simplified foreign key structure

#### **Question Units**

Defines which questions must be kept together during randomization.

```sql
CREATE TABLE question_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- JLPT Structure
  level VARCHAR(2) NOT NULL CHECK (level IN ('N1','N2','N3','N4','N5')),
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),
  mondai_number INTEGER NOT NULL CHECK (mondai_number BETWEEN 1 AND 20),

  -- Unit Type
  unit_type VARCHAR(30) NOT NULL CHECK (unit_type IN (
    'cloze_test',           -- Fill-in-blank (N1-N5 問題7/9/3)
    'reading_comp',         -- Short passage with questions
    'long_reading',         -- Long passage (N1 問題10, 12)
    'ab_comparison',        -- Two related passages (N1 問題11)
    'info_graphic',         -- Infographic/poster (N1 問題13)
    'long_audio_multi'      -- One audio, multiple questions
  )),

  -- Passages (support A-B comparison)
  passage_id UUID NOT NULL REFERENCES passages(id) ON DELETE CASCADE,
  passage_id_secondary UUID REFERENCES passages(id) ON DELETE CASCADE, -- For A-B comparison

  -- Aggregate Metadata
  difficulty_level VARCHAR(10) DEFAULT 'medium' CHECK (
    difficulty_level IN ('easy', 'medium', 'hard')
  ),

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT chk_ab_comparison CHECK (
    (unit_type = 'ab_comparison' AND passage_id_secondary IS NOT NULL) OR
    (unit_type != 'ab_comparison' AND passage_id_secondary IS NULL)
  )
);

CREATE INDEX idx_question_units_lookup
ON question_units(level, section_type, mondai_number, is_active);

CREATE INDEX idx_question_units_passages
ON question_units(passage_id, passage_id_secondary);
```

#### **Unit Questions Mapping**

Links questions to their units (many-to-many).

```sql
CREATE TABLE unit_questions (
  unit_id UUID NOT NULL REFERENCES question_units(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

  PRIMARY KEY (unit_id, question_id)
);

CREATE INDEX idx_unit_questions_question ON unit_questions(question_id);
CREATE INDEX idx_unit_questions_unit ON unit_questions(unit_id);
```

**Simplified Design**:

- ✅ Removed `question_order` field (use `questions.question_number` instead)
- ✅ Single source of truth for question ordering

#### **Answer Choices**

```sql
CREATE TABLE answer_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

  -- Static Answer Key Reference (NEVER changes)
  choice_number INTEGER NOT NULL CHECK (choice_number BETWEEN 1 AND 4),

  -- Choice Content
  choice_type VARCHAR(10) DEFAULT 'text' CHECK (choice_type IN ('text', 'image')),
  choice_text TEXT,
  choice_media_url VARCHAR(500), -- For image choices (N3 Chokai pictures)

  -- Display Order (for admin/default view, NOT for quiz randomization)
  order_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure text or image provided
  CONSTRAINT chk_choice_content CHECK (
    choice_text IS NOT NULL OR choice_media_url IS NOT NULL
  ),

  -- Ensure unique choice numbers per question
  CONSTRAINT uq_question_choice UNIQUE (question_id, choice_number)
);

CREATE INDEX idx_answer_choices_question
ON answer_choices(question_id, choice_number);

-- Validation: Ensure all questions have 3-4 choices
CREATE OR REPLACE FUNCTION validate_answer_choices_count()
RETURNS TRIGGER AS $$
DECLARE
  choice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO choice_count
  FROM answer_choices
  WHERE question_id = NEW.question_id;

  IF choice_count < 3 OR choice_count > 4 THEN
    RAISE EXCEPTION 'Questions must have 3-4 answer choices (currently: %)', choice_count;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_answer_choices_count
AFTER INSERT OR UPDATE OR DELETE ON answer_choices
FOR EACH ROW
EXECUTE FUNCTION validate_answer_choices_count();
```

---

### 2.4 Test Management

#### **Test Attempts**

User's test session with embedded question snapshot.

```sql
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Test Configuration
  level VARCHAR(2) NOT NULL CHECK (level IN ('N1','N2','N3','N4','N5')),
  test_mode VARCHAR(20) DEFAULT 'full_test' CHECK (
    test_mode IN ('full_test', 'practice')
  ),

  -- Question Snapshot (JSONB for flexibility)
  questions_snapshot JSONB NOT NULL,
  /* Structure:
  {
    "vocabulary": [
      { "mondai": 1, "question_ids": ["uuid1", "uuid2", ...] },
      { "mondai": 2, "question_ids": [...] }
    ],
    "grammar_reading": [...],
    "listening": [...]
  }
  */

  -- Session Data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (
    status IN ('in_progress', 'completed', 'abandoned')
  ),

  -- Results (calculated after completion)
  total_score DECIMAL(5,2),
  is_passed BOOLEAN,

  -- Choice Randomization Seed (deterministic shuffling)
  shuffle_seed VARCHAR(50) NOT NULL DEFAULT gen_random_uuid()::TEXT
);

CREATE INDEX idx_test_attempts_user
ON test_attempts(user_id, started_at DESC);

CREATE INDEX idx_test_attempts_status
ON test_attempts(user_id, status);

CREATE INDEX idx_test_attempts_level
ON test_attempts(user_id, level, completed_at DESC);
```

**Key Changes**:

- ✅ Removed `generated_tests` table (questions stored in JSONB snapshot)
- ✅ Added `shuffle_seed` for deterministic choice randomization (no separate table)
- ✅ Simplified structure (no foreign key to non-existent generated_tests)

**Choice Randomization Logic** (Application Layer):

```typescript
// Deterministic shuffle per test session
function getShuffledChoices(
  testAttemptId: string,
  questionId: string,
  shuffleSeed: string
): number[] {
  const seed = `${shuffleSeed}-${questionId}`;
  const rng = seedrandom(seed); // Deterministic RNG
  return shuffleArray([1, 2, 3, 4], rng);
}

// Usage in quiz UI
const shuffledOrder = getShuffledChoices(attempt.id, question.id, attempt.shuffle_seed);

// Display choices in shuffled order
const displayChoices = shuffledOrder.map(choiceNum =>
  choices.find(c => c.choice_number === choiceNum)
);

// When user selects position 2 (0-indexed):
const selectedPosition = 2;
const selectedChoiceNumber = shuffledOrder[selectedPosition]; // e.g., 4
const isCorrect = selectedChoiceNumber === question.correct_answer;
```

**Benefits**:

- ✅ No extra DB table needed
- ✅ Consistent shuffle within session
- ✅ Reproducible for review/debugging
- ✅ Minimal storage overhead

#### **Section Submissions**

Tracks when user submits each section (prevents going back).

```sql
CREATE TABLE section_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER,
  is_locked BOOLEAN DEFAULT true,

  UNIQUE(test_attempt_id, section_type)
);

CREATE INDEX idx_section_submissions_attempt
ON section_submissions(test_attempt_id);
```

#### **User Answers**

Individual answer records with timing data.

```sql
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,

  -- User Response
  selected_answer INTEGER CHECK (selected_answer BETWEEN 1 AND 4),
  -- References choice_number (NOT display position)

  is_correct BOOLEAN,
  is_flagged BOOLEAN DEFAULT false, -- Flagged for review

  -- Timing
  time_spent_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(test_attempt_id, question_id)
);

CREATE INDEX idx_user_answers_attempt
ON user_answers(test_attempt_id);

CREATE INDEX idx_user_answers_question
ON user_answers(question_id, is_correct);
```

#### **Section Scores**

Calculated results per section for online tests.

```sql
CREATE TABLE section_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),

  -- Raw Scores
  raw_score INTEGER NOT NULL, -- Total correct answers
  weighted_score DECIMAL(6,2) NOT NULL, -- Sum of (correct * weight)
  raw_max_score DECIMAL(6,2) NOT NULL, -- Maximum possible weighted score

  -- Normalized Score (0-60 scale)
  normalized_score DECIMAL(5,2) NOT NULL CHECK (
    normalized_score BETWEEN 0 AND 60
  ),

  -- Pass/Fail
  is_passed BOOLEAN NOT NULL,
  reference_grade CHAR(1) CHECK (reference_grade IN ('A', 'B', 'C')),
  -- A: ≥67%, B: 34-66%, C: <34%

  UNIQUE(test_attempt_id, section_type)
);

CREATE INDEX idx_section_scores_attempt
ON section_scores(test_attempt_id);

CREATE INDEX idx_section_scores_performance
ON section_scores(section_type, normalized_score DESC);
```

**Calculation Formula** (Application Layer):

```typescript
// Calculate section score
function calculateSectionScore(
  level: JLPTLevel,
  section: SectionType,
  userAnswers: UserAnswer[]
): SectionScore {
  let rawScore = 0;
  let weightedScore = 0;
  let rawMaxScore = 0;

  // Group answers by mondai
  const answersByMondai = groupBy(userAnswers, a => a.question.mondai_number);

  for (const [mondaiNum, answers] of answersByMondai) {
    const weight = getMondaiWeight(level, section, mondaiNum);
    const correct = answers.filter(a => a.is_correct).length;
    const total = answers.length;

    rawScore += correct;
    weightedScore += correct * weight;
    rawMaxScore += total * weight;
  }

  const normalizedScore = (weightedScore / rawMaxScore) * 60;
  const percentage = rawScore / userAnswers.length;
  const referenceGrade = percentage >= 0.67 ? 'A' : percentage >= 0.34 ? 'B' : 'C';

  return {
    raw_score: rawScore,
    weighted_score: weightedScore,
    raw_max_score: rawMaxScore,
    normalized_score: normalizedScore,
    is_passed: normalizedScore >= getSectionPassingScore(level),
    reference_grade: referenceGrade,
  };
}
```

---

### 2.5 Offline Calculator

#### **Offline Test Results**

Separate table for offline calculator history (external test score calculations).

```sql
CREATE TABLE offline_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Test Info
  level VARCHAR(2) NOT NULL CHECK (level IN ('N1','N2','N3','N4','N5')),
  source VARCHAR(50), -- 'Sou Matome', 'Kanzen Master', 'Official Sample', etc.
  user_note TEXT, -- Free text for context

  -- Results
  total_score DECIMAL(5,2) NOT NULL,
  is_passed BOOLEAN NOT NULL,

  -- Raw Input Data (preserves original calculation)
  raw_inputs JSONB NOT NULL,
  /* Structure:
  {
    "vocabulary": {
      "問題1": {"correct": 10, "total": 12},
      "問題2": {"correct": 6, "total": 8}
    },
    "grammar_reading": {...},
    "listening": {...}
  }
  */

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offline_results_user
ON offline_test_results(user_id, created_at DESC);

CREATE INDEX idx_offline_results_level
ON offline_test_results(user_id, level);
```

#### **Offline Section Scores**

Calculated results per section for offline calculator tests.

```sql
CREATE TABLE offline_section_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offline_test_result_id UUID NOT NULL REFERENCES offline_test_results(id) ON DELETE CASCADE,
  section_type VARCHAR(20) NOT NULL CHECK (
    section_type IN ('vocabulary', 'grammar_reading', 'listening')
  ),

  -- Same structure as section_scores
  raw_score INTEGER NOT NULL,
  weighted_score DECIMAL(6,2) NOT NULL,
  raw_max_score DECIMAL(6,2) NOT NULL,
  normalized_score DECIMAL(5,2) NOT NULL CHECK (
    normalized_score BETWEEN 0 AND 60
  ),
  is_passed BOOLEAN NOT NULL,
  reference_grade CHAR(1) CHECK (reference_grade IN ('A', 'B', 'C')),

  UNIQUE(offline_test_result_id, section_type)
);

CREATE INDEX idx_offline_section_scores_result
ON offline_section_scores(offline_test_result_id);
```

**Key Points**:

- ✅ Completely separate from online test tables
- ✅ Same calculation formulas as online tests
- ✅ Preserves raw inputs in JSONB for audit trail
- ✅ No relationship to `test_attempts` or `user_answers`

---

## 3. Analytics

### 3.1 Question Analytics (Phase 1 - MVP)

```sql
CREATE TABLE question_analytics (
  question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,

  -- Usage Stats
  times_presented INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  success_rate DECIMAL(5,4), -- Calculated: times_correct / times_presented

  -- Performance Metrics
  average_time_spent_seconds INTEGER,
  discrimination_index DECIMAL(5,4), -- Differentiates strong/weak students

  -- Quality Flags
  is_too_easy BOOLEAN DEFAULT false, -- success_rate > 0.90
  is_too_hard BOOLEAN DEFAULT false, -- success_rate < 0.10
  needs_review BOOLEAN DEFAULT false,

  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_question_analytics_quality
ON question_analytics(success_rate, needs_review);
```

**Update Trigger** (Auto-calculate after user answers):

```sql
CREATE OR REPLACE FUNCTION update_question_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO question_analytics (question_id, times_presented, times_correct)
  VALUES (NEW.question_id, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)
  ON CONFLICT (question_id) DO UPDATE SET
    times_presented = question_analytics.times_presented + 1,
    times_correct = question_analytics.times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    success_rate = (question_analytics.times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)::DECIMAL
                   / (question_analytics.times_presented + 1),
    is_too_easy = (success_rate > 0.90),
    is_too_hard = (success_rate < 0.10),
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_analytics
AFTER INSERT ON user_answers
FOR EACH ROW
EXECUTE FUNCTION update_question_analytics();
```

### 3.2 User Analytics (Phase 2 - Defer)

**Calculate on-demand using queries**:

```sql
-- User performance by level (calculated query, not stored table)
SELECT
  user_id,
  level,
  COUNT(*) as total_attempts,
  AVG(total_score) as average_score,
  MAX(total_score) as best_score,
  SUM(CASE WHEN is_passed THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) as pass_rate,
  MAX(completed_at) as last_attempt_date
FROM test_attempts
WHERE status = 'completed'
GROUP BY user_id, level;

-- User section strengths (calculated query)
SELECT
  ta.user_id,
  ta.level,
  ss.section_type,
  AVG(ss.normalized_score) as avg_score,
  AVG(CASE
    WHEN ss.reference_grade = 'A' THEN 3
    WHEN ss.reference_grade = 'B' THEN 2
    ELSE 1
  END) as avg_grade_numeric,
  COUNT(*) as attempts,
  CASE
    WHEN AVG(ss.normalized_score) >= 50 THEN 'strong'
    WHEN AVG(ss.normalized_score) >= 35 THEN 'average'
    ELSE 'weak'
  END as strength_indicator
FROM test_attempts ta
JOIN section_scores ss ON ta.id = ss.test_attempt_id
WHERE ta.status = 'completed'
GROUP BY ta.user_id, ta.level, ss.section_type;
```

**When to create materialized views**:

- ⏱️ When queries take >1 second
- 📊 When user base exceeds 10,000+ attempts
- 🔄 Refresh strategy: Nightly cron job or incremental updates

---

## 4. Entity Relationship Diagram

```
users
  ├──< test_attempts
  │     ├──< user_answers ──> questions ──┬──< answer_choices
  │     ├──< section_submissions          │
  │     └──< section_scores               ├──< question_analytics
  │                                        │
  └──< offline_test_results               └──> passages
        └──< offline_section_scores

question_units ──┬──> passages (primary)
                 ├──> passages (secondary, for A-B comparison)
                 └──< unit_questions ──> questions

scoring_configs (lookup table)
```

**Simplified Relationships**:

- ✅ Removed `generated_tests` layer
- ✅ Removed `question_pools` layer
- ✅ Removed `session_choice_orders` (deterministic shuffling)
- ✅ Cleaner hierarchy: users → attempts → answers → questions

---

## 5. Indexing Strategy

### Performance-Critical Indexes

```sql
-- Question lookup by level/section/mondai
CREATE INDEX idx_questions_lookup
ON questions(level, section_type, mondai_number, is_active);

-- Question-passage relationship
CREATE INDEX idx_questions_passage
ON questions(passage_id, question_number)
WHERE passage_id IS NOT NULL;

-- User answer lookup
CREATE INDEX idx_user_answers_attempt
ON user_answers(test_attempt_id);

CREATE INDEX idx_user_answers_question
ON user_answers(question_id, is_correct);

-- Test attempts by user
CREATE INDEX idx_test_attempts_user
ON test_attempts(user_id, started_at DESC);

CREATE INDEX idx_test_attempts_level
ON test_attempts(user_id, level, completed_at DESC);

-- Section scores
CREATE INDEX idx_section_scores_attempt
ON section_scores(test_attempt_id);

-- Offline test results
CREATE INDEX idx_offline_results_user
ON offline_test_results(user_id, created_at DESC);

CREATE INDEX idx_offline_section_scores_result
ON offline_section_scores(offline_test_result_id);

-- Question analytics
CREATE INDEX idx_question_analytics_quality
ON question_analytics(success_rate, needs_review);

-- Unit questions mapping
CREATE INDEX idx_unit_questions_unit
ON unit_questions(unit_id);

CREATE INDEX idx_unit_questions_question
ON unit_questions(question_id);
```

---

## 6. Data Integrity & Validation

### 6.1 Foreign Key Cascade Behaviors

```sql
-- Delete test attempt → cascade to all related data
ALTER TABLE user_answers
ADD CONSTRAINT fk_test_attempt
FOREIGN KEY (test_attempt_id)
REFERENCES test_attempts(id)
ON DELETE CASCADE;

ALTER TABLE section_submissions
ADD CONSTRAINT fk_test_attempt
FOREIGN KEY (test_attempt_id)
REFERENCES test_attempts(id)
ON DELETE CASCADE;

ALTER TABLE section_scores
ADD CONSTRAINT fk_test_attempt
FOREIGN KEY (test_attempt_id)
REFERENCES test_attempts(id)
ON DELETE CASCADE;

-- Delete passage → set NULL on questions (preserve questions)
ALTER TABLE questions
ADD CONSTRAINT fk_passage
FOREIGN KEY (passage_id)
REFERENCES passages(id)
ON DELETE SET NULL;

-- Delete offline test result → cascade to section scores
ALTER TABLE offline_section_scores
ADD CONSTRAINT fk_offline_test_result
FOREIGN KEY (offline_test_result_id)
REFERENCES offline_test_results(id)
ON DELETE CASCADE;

-- Delete unit → cascade delete unit_questions mapping
ALTER TABLE unit_questions
ADD CONSTRAINT fk_unit
FOREIGN KEY (unit_id)
REFERENCES question_units(id)
ON DELETE CASCADE;

-- Delete question → cascade delete answer choices
ALTER TABLE answer_choices
ADD CONSTRAINT fk_question
FOREIGN KEY (question_id)
REFERENCES questions(id)
ON DELETE CASCADE;
```

### 6.2 Data Validation Triggers

```sql
-- Validate mondai configuration exists
CREATE OR REPLACE FUNCTION validate_mondai_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Check in application config (this is a placeholder)
  -- Real validation happens in application layer using MONDAI_CONFIG
  IF NEW.mondai_number < 1 OR NEW.mondai_number > 20 THEN
    RAISE EXCEPTION 'Invalid mondai_number: %. Must be between 1-20', NEW.mondai_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_mondai_before_insert
BEFORE INSERT OR UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION validate_mondai_config();

-- Validate answer choices count (3-4 choices per question)
CREATE OR REPLACE FUNCTION validate_answer_choices_count()
RETURNS TRIGGER AS $$
DECLARE
  choice_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO choice_count
  FROM answer_choices
  WHERE question_id = COALESCE(NEW.question_id, OLD.question_id);

  IF choice_count < 3 OR choice_count > 4 THEN
    RAISE EXCEPTION 'Questions must have 3-4 answer choices (currently: %)', choice_count;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_answer_choices_count
AFTER INSERT OR UPDATE OR DELETE ON answer_choices
FOR EACH ROW
EXECUTE FUNCTION validate_answer_choices_count();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_passages_updated_at
BEFORE UPDATE ON passages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### 6.3 Validation Constraints

```sql
-- Ensure correct_answer is valid (1-4)
ALTER TABLE questions
ADD CONSTRAINT chk_correct_answer
CHECK (correct_answer BETWEEN 1 AND 4);

-- Ensure choice_number is valid (1-4)
ALTER TABLE answer_choices
ADD CONSTRAINT chk_choice_number
CHECK (choice_number BETWEEN 1 AND 4);

-- Ensure normalized_score is 0-60
ALTER TABLE section_scores
ADD CONSTRAINT chk_normalized_score
CHECK (normalized_score BETWEEN 0 AND 60);

ALTER TABLE offline_section_scores
ADD CONSTRAINT chk_offline_normalized_score
CHECK (normalized_score BETWEEN 0 AND 60);

-- Ensure passages have content
ALTER TABLE passages
ADD CONSTRAINT chk_content_provided
CHECK (content_text IS NOT NULL OR media_url IS NOT NULL);

-- Ensure answer choices have content
ALTER TABLE answer_choices
ADD CONSTRAINT chk_choice_content
CHECK (choice_text IS NOT NULL OR choice_media_url IS NOT NULL);

-- Ensure A-B comparison units have secondary passage
ALTER TABLE question_units
ADD CONSTRAINT chk_ab_comparison
CHECK (
  (unit_type = 'ab_comparison' AND passage_id_secondary IS NOT NULL) OR
  (unit_type != 'ab_comparison' AND passage_id_secondary IS NULL)
);
```

---

## Summary of Changes (v1 → v2)

### Removed Tables (8 tables)

1. ❌ `question_pools` → Redundant counts
2. ❌ `generated_tests` → Over-complicated
3. ❌ `generated_test_questions` → Over-complicated
4. ❌ `session_choice_orders` → Use deterministic shuffling
5. ❌ `user_performance_summary` → Defer to Phase 2
6. ❌ `user_section_analytics` → Defer to Phase 2
7. ❌ `user_mondai_analytics` → Defer to Phase 2
8. ❌ `user_question_history` → Defer to Phase 2
9. ❌ `test_analytics` → Defer to Phase 2
10. ❌ `question_pool_health` → Defer to Phase 2

### Removed Fields

- ❌ `questions.question_context` (deprecated)
- ❌ `questions.times_used` → Moved to `question_analytics`
- ❌ `questions.success_rate` → Moved to `question_analytics`
- ❌ `passages.content_text_secondary` → Use `question_units.passage_id_secondary`
- ❌ `passages.passage_type` → Use `question_units.unit_type`
- ❌ `unit_questions.question_order` → Use `questions.question_number`

### Moved to Config

- ✅ `mondai_weights` → `src/config/jlpt-mondai.ts`

### Simplified Tables

- ✅ `passages` → Cleaner schema (one passage = one entity)
- ✅ `test_attempts` → Added `questions_snapshot` JSONB + `shuffle_seed`
- ✅ `questions` → Removed redundant fields
- ✅ `unit_questions` → Simplified (removed `question_order`)

### Added Features

- ✅ Deterministic choice shuffling (no DB table needed)
- ✅ Comprehensive data validation triggers
- ✅ Auto-updating analytics via triggers
- ✅ Better constraints and cascade behaviors

### Result

**Before**: 25+ tables
**After**: 15 core tables (10 tables removed)

**Token Efficiency**: ~40% reduction in schema complexity
**Maintainability**: ↑ Significantly improved
**Implementation Speed**: ↑ Faster MVP delivery

---

## Related Documentation

- **[Test Level Details](./02-test-level-details.md)**: N5-N1 structure breakdown
- **[Scoring Calculation](./03-scoring-calculation.md)**: Weight calculation and normalization
- **[Mondai Configuration](../src/config/jlpt-mondai.ts)**: Static reference data
- **[Import/Export Strategy](./06-import-export-strategy.md)**: Data migration templates

---

**Version History**:

- v2.0 (2025-12-28): Major simplification, removed over-engineering
- v1.0 (2025-12-28): Initial design (deprecated)

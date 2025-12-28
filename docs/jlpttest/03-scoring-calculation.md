# Scoring Calculation - JLPT Tryout Application

**Version**: 1.0
**Last Updated**: 2025-12-28
**Related Documents**: [Database Design](./01-database-design.md), [Test Level Details](./02-test-level-details.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Calculation Pipeline](#2-calculation-pipeline)
3. [Formulas and Algorithms](#3-formulas-and-algorithms)
4. [Special Cases](#4-special-cases)
5. [Pass/Fail Criteria](#5-passfail-criteria)
6. [Reference Grade System](#6-reference-grade-system)
7. [Configuration Tables](#7-configuration-tables)

---

## 1. Overview

The JLPT scoring system uses a **weighted scoring** approach followed by **normalization** to a standard 60-point scale per section.

### Core Principles

1. **Weight-Based Scoring**: Different mondai have different weights (1, 2, 2.5, 3, 4, 7, 9)
2. **Normalization**: All sections normalized to 60 points for consistency
3. **Sectional Minimums**: Each section must meet minimum threshold
4. **Overall Minimum**: Total score must meet level-specific threshold
5. **Reference Grades**: A/B/C grades based on performance percentage

---

## 2. Calculation Pipeline

### 2.1 Six-Step Process

```
┌─────────────────────────────────────────┐
│ STEP 1: VALIDATION LAYER                │
│ ├─ Check minimum answers (≥5)           │
│ ├─ Validate answer range (1-4 or 1-3)   │
│ └─ Verify test_attempt exists           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ STEP 2: SECTION SCORING LAYER           │
│ ├─ Group answers by section             │
│ ├─ Lookup question weights              │
│ ├─ Calculate weighted raw score         │
│ ├─ Get raw maximum for section          │
│ └─ Normalize to 60-point scale          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ STEP 3: REFERENCE GRADE CALCULATION     │
│ ├─ Calculate correct/total ratio        │
│ ├─ Apply thresholds (A≥67%, B≥34%, C)  │
│ └─ Store per section                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ STEP 4: TOTAL SCORE CALCULATION         │
│ └─ Sum all normalized section scores    │
│    (maximum 180 points)                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ STEP 5: PASS/FAIL EVALUATION            │
│ ├─ Check overall minimum threshold      │
│ ├─ Check each section minimum           │
│ └─ Determine final pass/fail            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ STEP 6: RESULT STORAGE                  │
│ ├─ Save section_scores records          │
│ ├─ Update test_attempt with totals      │
│ └─ Generate analytics records           │
└─────────────────────────────────────────┘
```

---

## 3. Formulas and Algorithms

### 3.1 Step 1: Validation

```python
def validate_answers(test_attempt_id, answers):
    """
    Validate user answers before calculation
    """
    # Check minimum number of answers
    if len(answers) < 5:
        raise ValidationError("Minimum 5 answers required")

    # Validate test attempt exists and is valid
    test_attempt = get_test_attempt(test_attempt_id)
    if not test_attempt or test_attempt.status != 'in_progress':
        raise ValidationError("Invalid test attempt")

    # Validate answer range
    for answer in answers:
        if answer.selected_answer not in [1, 2, 3, 4]:
            raise ValidationError("Invalid answer choice")

    return True
```

### 3.2 Step 2: Calculate Weighted Score

```python
def calculate_weighted_score(section_answers, level, section_type):
    """
    Calculate weighted score for a section

    Args:
        section_answers: List of (question_id, mondai_number, is_correct)
        level: N1|N2|N3|N4|N5
        section_type: vocabulary|grammar_reading|listening

    Returns:
        {
            'raw_score': int,           # Number correct
            'weighted_score': float,    # Sum of weights for correct answers
            'raw_max_score': float      # Maximum possible weighted score
        }
    """
    weighted_score = 0.0
    raw_max_score = 0.0
    raw_score = 0

    for question in section_answers:
        # Get weight from mondai_weights table
        weight = get_mondai_weight(
            level=level,
            section_type=section_type,
            mondai_number=question.mondai_number
        )

        # Add to raw max
        raw_max_score += weight

        # Add to weighted score if correct
        if question.is_correct:
            weighted_score += weight
            raw_score += 1

    return {
        'raw_score': raw_score,
        'weighted_score': weighted_score,
        'raw_max_score': raw_max_score
    }
```

**Example (N5 Vocabulary)**:

```
Questions: 35 total
Mondai breakdown:
- 問題1 (weight=1): 12 questions → max = 12 × 1 = 12
- 問題2 (weight=1): 8 questions  → max = 8 × 1 = 8
- 問題3 (weight=1): 10 questions → max = 10 × 1 = 10
- 問題4 (weight=1): 5 questions  → max = 5 × 1 = 5

Raw max score = 35

User answers correctly:
- 問題1: 10/12 → weighted = 10 × 1 = 10
- 問題2: 6/8   → weighted = 6 × 1 = 6
- 問題3: 8/10  → weighted = 8 × 1 = 8
- 問題4: 4/5   → weighted = 4 × 1 = 4

Weighted score = 28
```

### 3.3 Step 3: Normalize to 60-Point Scale

```python
def normalize_score(weighted_score, raw_max_score):
    """
    Normalize weighted score to 60-point scale

    Formula: normalized = (weighted_score / raw_max_score) × 60

    Args:
        weighted_score: Sum of weights for correct answers
        raw_max_score: Maximum possible weighted score

    Returns:
        float: Normalized score (0-60)
    """
    if raw_max_score == 0:
        return 0.0

    normalized = (weighted_score / raw_max_score) * 60.0

    # Round to 2 decimal places
    return round(normalized, 2)
```

**Example (N5 Vocabulary)**:

```
weighted_score = 28
raw_max_score = 35

normalized_score = (28 / 35) × 60 = 48.0/60
```

### 3.4 Step 4: Calculate Total Score

```python
def calculate_total_score(section_scores):
    """
    Sum all normalized section scores

    Args:
        section_scores: Dict of {section_type: normalized_score}

    Returns:
        float: Total score (0-180)
    """
    total = sum(section_scores.values())
    return round(total, 2)
```

**Example (N5)**:

```
Vocabulary:          48.0/60
Grammar/Reading:     42.0/60
Listening:          38.0/60
-------------------------
Total:              128.0/180
```

### 3.5 Step 5: Evaluate Pass/Fail

```python
def evaluate_pass_fail(level, section_scores, total_score):
    """
    Determine if user passed based on level-specific criteria

    Args:
        level: N1|N2|N3|N4|N5
        section_scores: Dict of {section_type: normalized_score}
        total_score: Total score (0-180)

    Returns:
        {
            'is_passed': bool,
            'overall_pass': bool,
            'sectional_pass': bool,
            'failures': List[str]
        }
    """
    config = get_scoring_config(level)
    failures = []

    # Check overall minimum
    overall_pass = total_score >= config.overall_passing_score
    if not overall_pass:
        failures.append(f"Total score {total_score} < {config.overall_passing_score}")

    # Check sectional minimums
    sectional_pass = True

    if level in ['N5', 'N4']:
        # Combined vocabulary + grammar/reading check
        combined = (section_scores['vocabulary'] +
                   section_scores['grammar_reading'])
        if combined < 38:
            sectional_pass = False
            failures.append(f"Vocab+Grammar {combined} < 38")

        # Listening minimum
        if section_scores['listening'] < 19:
            sectional_pass = False
            failures.append(f"Listening {section_scores['listening']} < 19")

    else:  # N3, N2, N1
        # Each section must meet 19/60 minimum
        for section_type, score in section_scores.items():
            if score < 19:
                sectional_pass = False
                failures.append(f"{section_type} {score} < 19")

    is_passed = overall_pass and sectional_pass

    return {
        'is_passed': is_passed,
        'overall_pass': overall_pass,
        'sectional_pass': sectional_pass,
        'failures': failures
    }
```

### 3.6 Step 6: Calculate Reference Grades

```python
def calculate_reference_grade(raw_score, total_questions):
    """
    Calculate A/B/C reference grade

    Thresholds:
        A: ≥67% correct
        B: 34-66% correct
        C: <34% correct

    Args:
        raw_score: Number of correct answers
        total_questions: Total questions in section

    Returns:
        str: 'A', 'B', or 'C'
    """
    if total_questions == 0:
        return 'C'

    percentage = (raw_score / total_questions) * 100

    if percentage >= 67:
        return 'A'
    elif percentage >= 34:
        return 'B'
    else:
        return 'C'
```

**Example (N5 Vocabulary)**:

```
raw_score = 28
total_questions = 35

percentage = (28 / 35) × 100 = 80%
reference_grade = 'A'
```

---

## 4. Special Cases

### 4.1 N5 & N4: Combined Sectional Minimum

N5 and N4 combine Vocabulary and Grammar/Reading for sectional minimum check.

```python
def check_n4_n5_sectional_minimum(vocab_score, grammar_score, listening_score):
    """
    N4/N5 specific sectional minimum check

    Requirements:
        - (Vocabulary + Grammar/Reading) ≥ 38/120
        - Listening ≥ 19/60
    """
    combined = vocab_score + grammar_score

    combined_pass = combined >= 38
    listening_pass = listening_score >= 19

    return {
        'combined_pass': combined_pass,
        'listening_pass': listening_pass,
        'sectional_pass': combined_pass and listening_pass,
        'combined_score': combined,
        'listening_score': listening_score
    }
```

**Example (N5)**:

```
Vocabulary:          35/60
Grammar/Reading:     40/60
Listening:          25/60

Combined Check:
- Vocab + Grammar = 35 + 40 = 75/120 ✓ (≥38)
- Listening = 25/60 ✓ (≥19)
- Sectional: PASS ✓
```

**Storage**:

```sql
INSERT INTO section_scores (
    test_attempt_id,
    section_type,
    normalized_score,
    is_passed,
    reference_grade
) VALUES
    (1, 'vocabulary', 35.0, true, 'B'),
    (1, 'grammar_reading', 40.0, true, 'B'),
    (1, 'listening', 25.0, true, 'C');

-- Additional tracking field
UPDATE test_attempt SET
    vocab_grammar_combined = 75.0,
    is_vocab_grammar_passed = true
WHERE id = 1;
```

### 4.2 N3: Dual Normalization for Grammar/Reading

N3 Section 2 has two distinct parts normalized separately then averaged.

```python
def calculate_n3_grammar_reading_score(reading_answers, grammar_answers):
    """
    N3 dual normalization for Section 2

    Reading Part: 問題1-3 (23 questions, weight=1 each)
    Grammar Part: 問題4-7 (16 questions, weights: 3,4,4,4)

    Returns:
        {
            'reading_raw': int,
            'reading_normalized': float (0-60),
            'grammar_weighted': float,
            'grammar_normalized': float (0-60),
            'final_score': float (0-60)  # Average of both parts
        }
    """
    # Part 1: Reading (問題1-3)
    reading_raw = sum(1 for q in reading_answers if q.is_correct)
    reading_total = len(reading_answers)  # Should be 23
    reading_normalized = (reading_raw / reading_total) * 60

    # Part 2: Grammar (問題4-7)
    grammar_weighted = 0.0
    grammar_max = 0.0

    for question in grammar_answers:
        weight = get_mondai_weight('N3', 'grammar_reading', question.mondai_number)
        grammar_max += weight
        if question.is_correct:
            grammar_weighted += weight

    grammar_normalized = (grammar_weighted / grammar_max) * 60

    # Final score: Average of both normalized parts
    final_score = (reading_normalized + grammar_normalized) / 2

    return {
        'reading_raw': reading_raw,
        'reading_normalized': round(reading_normalized, 2),
        'grammar_weighted': grammar_weighted,
        'grammar_max': grammar_max,
        'grammar_normalized': round(grammar_normalized, 2),
        'final_score': round(final_score, 2)
    }
```

**Example (N3 Section 2)**:

```
Reading Part (問題1-3):
- Total questions: 23
- Correct: 15
- Normalized: (15/23) × 60 = 39.13/60

Grammar Part (問題4-7):
- 問題4 (weight=3): 3/4 correct → 3 × 3 = 9
- 問題5 (weight=4): 4/6 correct → 4 × 4 = 16
- 問題6 (weight=4): 3/4 correct → 3 × 4 = 12
- 問題7 (weight=4): 2/2 correct → 2 × 4 = 8
- Weighted score: 45
- Max score: (4×3) + (6×4) + (4×4) + (2×4) = 60
- Normalized: (45/60) × 60 = 45.0/60

Final Section 2 Score:
- Average: (39.13 + 45.0) / 2 = 42.07/60
```

**Storage**:

```sql
INSERT INTO section_scores (
    test_attempt_id,
    section_type,
    raw_score,
    weighted_score,
    raw_max_score,
    normalized_score,
    is_passed,
    reference_grade,
    metadata
) VALUES (
    1,
    'grammar_reading',
    NULL,  -- Not applicable for dual normalization
    NULL,  -- Not applicable
    NULL,  -- Not applicable
    42.07, -- Final averaged score
    true,
    'B',
    '{
        "reading_raw": 15,
        "reading_total": 23,
        "reading_normalized": 39.13,
        "grammar_weighted": 45,
        "grammar_max": 60,
        "grammar_normalized": 45.0
    }'::jsonb
);
```

---

## 5. Pass/Fail Criteria

### 5.1 Overall Pass Requirements

| Level  | Total Score | Vocab+Grammar    | Grammar/Reading | Listening |
| ------ | ----------- | ---------------- | --------------- | --------- |
| **N1** | ≥100/180    | ≥19/60 each      | ≥19/60          | ≥19/60    |
| **N2** | ≥90/180     | ≥19/60 each      | ≥19/60          | ≥19/60    |
| **N3** | ≥95/180     | ≥19/60           | ≥19/60          | ≥19/60    |
| **N4** | ≥90/180     | ≥38/120 combined | -               | ≥19/60    |
| **N5** | ≥80/180     | ≥38/120 combined | -               | ≥19/60    |

### 5.2 Pass/Fail Examples

#### Example 1: N5 PASS

```
Vocabulary:          48/60 ✓
Grammar/Reading:     42/60 ✓
Listening:          38/60 ✓
Total:              128/180 ✓

Checks:
✓ Total (128) ≥ 80
✓ Vocab+Grammar (90) ≥ 38
✓ Listening (38) ≥ 19
Result: PASS
```

#### Example 2: N5 FAIL (Sectional)

```
Vocabulary:          25/60
Grammar/Reading:     12/60
Listening:          45/60
Total:              82/180

Checks:
✓ Total (82) ≥ 80
✗ Vocab+Grammar (37) < 38  ← FAIL
✓ Listening (45) ≥ 19
Result: FAIL (Sectional minimum not met)
```

#### Example 3: N3 PASS

```
Vocabulary:          35/60 ✓
Grammar/Reading:     42/60 ✓ (dual normalized)
Listening:          28/60 ✓
Total:              105/180 ✓

Checks:
✓ Total (105) ≥ 95
✓ Vocabulary (35) ≥ 19
✓ Grammar/Reading (42) ≥ 19
✓ Listening (28) ≥ 19
Result: PASS
```

#### Example 4: N1 FAIL (Overall)

```
Vocabulary:          45/60 ✓
Grammar/Reading:     38/60 ✓
Listening:          12/60 ✗
Total:              95/180 ✗

Checks:
✗ Total (95) < 100  ← FAIL
✓ Vocabulary (45) ≥ 19
✓ Grammar/Reading (38) ≥ 19
✗ Listening (12) < 19  ← FAIL
Result: FAIL (Multiple failures)
```

---

## 6. Reference Grade System

### 6.1 Grade Thresholds

Reference grades are **informational only** and do not affect pass/fail status.

```
Grade A: ≥67% correct (High proficiency)
Grade B: 34-66% correct (Moderate proficiency)
Grade C: <34% correct (Basic proficiency)
```

### 6.2 Grade Calculation Examples

| Raw Score | Total Questions | Percentage | Grade |
| --------- | --------------- | ---------- | ----- |
| 28/35     | 35              | 80%        | **A** |
| 18/35     | 35              | 51%        | **B** |
| 10/35     | 35              | 29%        | **C** |
| 16/24     | 24              | 67%        | **A** |
| 8/24      | 24              | 33%        | **C** |

---

## 7. Configuration Tables

### 7.1 Mondai Weights Configuration

```sql
-- mondai_weights table stores weight per mondai
CREATE TABLE mondai_weights (
    level VARCHAR(2) NOT NULL,
    section_type VARCHAR(20) NOT NULL,
    mondai_number INT NOT NULL,
    weight DECIMAL(3,1) NOT NULL,
    PRIMARY KEY (level, section_type, mondai_number)
);

-- Example data
INSERT INTO mondai_weights VALUES
    ('N5', 'vocabulary', 1, 1),
    ('N5', 'vocabulary', 2, 1),
    ('N5', 'grammar_reading', 4, 4),
    ('N5', 'listening', 1, 2),
    ('N5', 'listening', 2, 2.5),
    ('N1', 'vocabulary', 6, 2),
    ('N1', 'grammar_reading', 12, 3);
```

### 7.2 Scoring Configuration

```sql
CREATE TABLE scoring_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(2) NOT NULL,
    section_type VARCHAR(20) NOT NULL,
    raw_max_score DECIMAL(5,1) NOT NULL,
    normalized_max INT DEFAULT 60,
    overall_passing_score INT NOT NULL,
    section_passing_score INT NOT NULL,
    has_dual_normalization BOOLEAN DEFAULT false,
    combined_with_section VARCHAR(20),
    UNIQUE KEY (level, section_type)
);

-- Example configurations
INSERT INTO scoring_configs VALUES
    (NULL, 'N5', 'vocabulary', 35, 60, 80, 38, false, 'grammar_reading'),
    (NULL, 'N5', 'grammar_reading', 50, 60, 80, 38, false, 'vocabulary'),
    (NULL, 'N5', 'listening', 59, 60, 80, 19, false, null),
    (NULL, 'N3', 'grammar_reading', 83, 60, 95, 19, true, null),
    (NULL, 'N2', 'vocabulary', 62, 60, 90, 19, false, null),
    (NULL, 'N1', 'vocabulary', 44, 60, 100, 19, false, null);
```

---

## Related Documentation

- **[Database Design](./01-database-design.md)**: Database schema for scoring tables
- **[Test Level Details](./02-test-level-details.md)**: Question counts and weights per level
- **[User Flow](./04-user-flow.md)**: How scores are displayed to users

---

## Appendix: Quick Reference

### Raw Maximum Scores (Pre-Normalization)

| Level | Vocabulary | Grammar/Reading | Listening |
| ----- | ---------- | --------------- | --------- |
| N5    | 35         | 50              | 59        |
| N4    | 45         | 99              | 62        |
| N3    | 35         | 83              | 50        |
| N2    | 62         | 56              | 46        |
| N1    | 44         | 64              | 56        |

### Common Weights by Level

| Weight | Typical Usage                          |
| ------ | -------------------------------------- |
| 1      | Basic vocabulary, simple grammar       |
| 2      | Standard listening, basic reading      |
| 2.5    | Listening comprehension                |
| 3      | Complex grammar, listening expressions |
| 4      | Reading comprehension, info graphics   |
| 7      | N4 advanced reading                    |
| 9      | N4 info graphic (highest weight)       |

---

**Version History**:

- v1.0 (2025-12-28): Initial scoring calculation document

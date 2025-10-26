# Scripts Directory

Utility scripts for Gengobot development and administration.

## 📋 User Management Scripts

### `create-test-users.ts`

Creates test users for development and testing.

**Usage:**

```bash
npm run user:create
```

**Purpose:** Quickly populate the database with test users for development.

### `create-db-users.ts`

Alternative user creation script with database-specific operations.

**Usage:**

```bash
npm run user:create-db
```

### `list-users.ts`

Lists all users in the database.

**Usage:**

```bash
npm run user:list
```

**Output:** Displays user IDs, emails, and admin status.

### `set-admin.ts`

Sets admin privileges for a specific user.

**Usage:**

```bash
npm run user:set-admin
```

**Interactive:** Prompts for user email to grant admin access.

### `make-admin.ts` (Legacy)

Legacy script for creating admin users. Use `set-admin.ts` instead.

## 🎯 Task Management Scripts

### `activate-all-tasks.ts`

Activates all tasks in the database for testing.

**Usage:**

```bash
ts-node scripts/activate-all-tasks.ts
```

**Purpose:** Useful for development when you need all tasks available.

### `check-task-attempts.ts`

Analyzes task attempt data and statistics.

**Usage:**

```bash
ts-node scripts/check-task-attempts.ts
```

**Output:** Task completion rates, attempt counts, and analytics.

### `clear-incomplete-attempts.ts`

Removes incomplete task attempts from the database.

**Usage:**

```bash
ts-node scripts/clear-incomplete-attempts.ts
```

**Purpose:** Clean up development/test data.

## 🗃️ Database & Migration Scripts

### `seed-subcategories.ts`

Seeds task subcategories into the database.

**Usage:**

```bash
ts-node scripts/seed-subcategories.ts
```

**Purpose:** Populate category data for task organization.

### `test-task-deck-migration.ts`

Tests task-deck migration functionality.

**Usage:**

```bash
ts-node scripts/test-task-deck-migration.ts
```

**Purpose:** Validate migration between task and deck systems.

### `verify-tables.js`

Verifies database table structure and integrity.

**Usage:**

```bash
node scripts/verify-tables.js
```

**Output:** Table existence, column validation, and schema checks.

## 🃏 Deck & Flashcard Scripts

### `check-taskdeck.js`

Checks TaskDeck model and relationships.

**Usage:**

```bash
node scripts/check-taskdeck.js
```

### `check-taskdeck-methods.js`

Validates TaskDeck methods and API endpoints.

**Usage:**

```bash
node scripts/check-taskdeck-methods.js
```

### `test-deck-creation.js`

Tests deck creation functionality.

**Usage:**

```bash
node scripts/test-deck-creation.js
```

### `test-flashcard-editor.md`

Documentation for flashcard editor testing procedures.

**Type:** Documentation
**Location:** [test-flashcard-editor.md](./test-flashcard-editor.md)

## ⚙️ Setup Scripts

### `setup-furigana.sh`

Sets up the furigana dictionary system for Japanese text reading aids.

**Usage:**

```bash
npm run setup:furigana
# or
bash scripts/setup-furigana.sh
```

**Purpose:** Downloads and configures kuromoji dictionary for furigana generation.

**Requirements:**

- Bash shell
- Internet connection for dictionary download
- Write permissions in public/dict/ directory

## 🔧 Script Categories

### Production-Ready Scripts

These scripts are safe to use and have corresponding npm commands:

- `create-test-users.ts` → `npm run user:create`
- `create-db-users.ts` → `npm run user:create-db`
- `list-users.ts` → `npm run user:list`
- `set-admin.ts` → `npm run user:set-admin`
- `setup-furigana.sh` → `npm run setup:furigana`

### Development/Testing Scripts

Use these for development and debugging:

- `activate-all-tasks.ts`
- `check-task-attempts.ts`
- `clear-incomplete-attempts.ts`
- `seed-subcategories.ts`
- `test-*.js` scripts

### Legacy Scripts

Older scripts kept for reference:

- `make-admin.ts` (use `set-admin.ts` instead)
- `check-taskdeck*.js` (TaskDeck validation)

## 📝 Notes

- All TypeScript scripts can be run with `ts-node scripts/<filename>`
- JavaScript scripts can be run with `node scripts/<filename>`
- Always backup your database before running migration or cleanup scripts
- Use `.env.local` for local development environment variables

## 🚨 Safety Guidelines

1. **Never run in production** without testing first
2. **Backup database** before running migration/cleanup scripts
3. **Review script output** before confirming destructive operations
4. **Use test environment** for experimental scripts
5. **Check environment variables** to ensure correct database connection

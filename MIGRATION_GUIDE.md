# Migration Guide: Simplified Feedback System

This guide will help you deploy the simplified feedback system changes to your VPS.

## Prerequisites

- Access to your VPS via SSH
- PostgreSQL database connection configured
- Node.js and npm installed

## Step-by-Step Instructions

### Step 1: Backup Your Database (CRITICAL!)

```bash
# Replace with your actual database credentials
pg_dump -h localhost -U your_db_user -d your_db_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Or if using environment variables
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

**⚠️ DO NOT SKIP THIS STEP! This backup will save you if something goes wrong.**

---

### Step 2: Navigate to Your Project Directory

```bash
cd /path/to/gengobot
```

---

### Step 3: Check Current Git Status

```bash
# See what branch you're on
git branch --show-current

# See if you have uncommitted changes
git status
```

If you have uncommitted changes, either commit them or stash them:

```bash
# Option A: Stash changes (temporary save)
git stash

# Option B: Commit changes
git add .
git commit -m "Save local changes before pulling updates"
```

---

### Step 4: Fetch and Pull the Fix Branch

```bash
# Fetch all branches from remote
git fetch origin

# Checkout the branch with the fix
git checkout claude/fix-overall-score-simplified-feedback-011CV44ynxpPD2BFyGndy2BM

# Pull latest changes
git pull origin claude/fix-overall-score-simplified-feedback-011CV44ynxpPD2BFyGndy2BM
```

**Alternative:** If you want to merge into feature/task-feedback-system:

```bash
git checkout feature/task-feedback-system
git fetch origin
git pull origin feature/task-feedback-system
git merge claude/fix-overall-score-simplified-feedback-011CV44ynxpPD2BFyGndy2BM
```

---

### Step 5: Install Dependencies

```bash
# Install/update npm packages
npm install
```

---

### Step 6: Generate Prisma Client

```bash
# Generate the Prisma client with new schema
npm run db:generate
```

**If you get checksum errors**, use:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate
```

---

### Step 7: Review the Migration

```bash
# View the migration file to understand what will change
cat prisma/migrations/20251112_simplified_feedback_system/migration.sql
```

This migration will:
- ✅ Add `maxMessages` to Task table
- ✅ Add new feedback columns to TaskAttempt
- ✅ Migrate existing data to JSON format
- ✅ Remove old score columns

---

### Step 8: Apply the Database Migration

**Option A: For Development/Staging (Recommended)**

```bash
# This will apply the migration and prompt for a name
npm run db:migrate
```

When prompted, press Enter to use the existing migration name.

**Option B: For Production (More Careful)**

```bash
# Mark the migration as applied without running it first
npx prisma migrate resolve --applied 20251112_simplified_feedback_system

# Then run the SQL manually to see output
psql $DATABASE_URL < prisma/migrations/20251112_simplified_feedback_system/migration.sql

# Or if you need to specify connection details
psql -h localhost -U your_db_user -d your_db_name < prisma/migrations/20251112_simplified_feedback_system/migration.sql
```

**Option C: Let Prisma Deploy It**

```bash
# Deploy all pending migrations (production-safe)
npm run db:migrate:deploy
```

---

### Step 9: Verify the Migration

```bash
# Check if the migration was applied successfully
npx prisma migrate status

# View the updated schema
npx prisma db pull

# Optional: Open Prisma Studio to inspect the database
npx prisma studio
```

In Prisma Studio:
- Check the `Task` table has `maxMessages` column
- Check the `TaskAttempt` table has new columns: `feedback`, `objectiveCompletionStatus`, `totalMessages`, etc.
- Verify old columns are gone: `overallScore`, `taskAchievement`, `fluency`, etc.

---

### Step 10: Seed the Database (Optional)

If you need to seed test data:

```bash
# Run the seed script
npm run db:seed
```

---

### Step 11: Build and Test the Application

```bash
# Type check
npm run type-check

# Build the application
npm run build

# If successful, restart your application
pm2 restart gengobot
# OR
systemctl restart gengobot
# OR however you manage your Node.js process
```

---

### Step 12: Verify the Application

```bash
# Check application logs
pm2 logs gengobot
# OR
journalctl -u gengobot -f

# Test a few endpoints
curl http://localhost:3000/api/health
```

Visit your application and test:
- ✅ Task attempts work
- ✅ Progress tracking displays correctly
- ✅ No console errors

---

## Troubleshooting

### Issue: Migration Fails

**Solution:**
```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Check what went wrong
npx prisma migrate status
```

### Issue: Prisma Client Type Errors

**Solution:**
```bash
# Regenerate Prisma client
rm -rf node_modules/.prisma
npm run db:generate
```

### Issue: Build Fails with Font Errors

This is normal in offline environments. The build will still work.

### Issue: Old Data Shows Incorrect Scores

The migration converts old numeric scores to a basic SimplifiedAssessment format. Old data will show:
- Completion rate based on old `taskAchievement` (if it existed)
- Generic feedback messages
- Most metrics set to 0 for legacy data

New attempts will have proper detailed feedback.

---

## Rollback Instructions

If something goes wrong and you need to rollback:

```bash
# Restore database from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Go back to previous branch
git checkout feature/task-feedback-system

# Reinstall dependencies
npm install

# Regenerate Prisma client with old schema
npm run db:generate

# Restart application
pm2 restart gengobot
```

---

## Quick Command Summary

For experienced users, here's the quick version:

```bash
# 1. Backup
pg_dump $DATABASE_URL > backup.sql

# 2. Pull changes
git fetch origin
git checkout claude/fix-overall-score-simplified-feedback-011CV44ynxpPD2BFyGndy2BM
git pull

# 3. Install & migrate
npm install
npm run db:generate
npm run db:migrate:deploy

# 4. Build & restart
npm run build
pm2 restart gengobot

# 5. Verify
npx prisma migrate status
pm2 logs gengobot
```

---

## Support

If you encounter issues:
1. Check the backup was created successfully
2. Review error messages carefully
3. Check application logs: `pm2 logs` or `journalctl -u gengobot`
4. Verify database connection: `npx prisma db pull`

Good luck! 🚀

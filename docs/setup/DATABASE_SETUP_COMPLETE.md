# Complete Database Setup Guide

## ✅ What's Been Fixed

All database connections in your project now use a **centralized Prisma client** from `src/lib/prisma.ts`. This ensures:

- ✅ Single database connection pool
- ✅ Proper connection management
- ✅ No connection leaks
- ✅ Better performance

### Files Updated (17 files):

**API Routes:**

- ✅ `src/app/api/tasks/route.ts`
- ✅ `src/app/api/tasks/[taskId]/route.ts`
- ✅ `src/app/api/tasks/[taskId]/analytics/route.ts`
- ✅ `src/app/api/tasks/bulk/route.ts`
- ✅ `src/app/api/tasks/search/route.ts`
- ✅ `src/app/api/task-categories/route.ts`

**Middleware:**

- ✅ `src/middleware.ts`

**Library Files:**

- ✅ `src/lib/storage/userProgressTracking.ts`
- ✅ `src/lib/storage/conversationStorage.ts`
- ✅ `src/lib/storage/taskAttemptPersistence.ts`
- ✅ `src/lib/export/dataExport.ts`
- ✅ `src/lib/backup/backupRecovery.ts`
- ✅ `src/lib/analytics/taskAnalytics.ts`

**Component Fix:**

- ✅ `src/app/dashboard/tasks/TasksClient.tsx` - Fixed `tasks.map` error

## 🚨 CRITICAL: Set Up Database Connection

Your application **cannot connect** to the database yet. Follow these steps:

### Step 1: Get Your Supabase Database Password

1. **Open Supabase Dashboard**:
   - Go to: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo/settings/database

2. **Find Connection String**:
   - Scroll to "Connection string" section
   - Click the **URI** tab
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
     ```
   - Click **Copy** button

3. **If You Don't Have the Password**:
   - Click "Reset database password"
   - Copy the new password shown
   - Use it in the connection string above

### Step 2: Update Your .env.local File

1. Open `.env.local` in your project
2. Find the line:

   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
   ```

3. Replace `[YOUR-SUPABASE-DB-PASSWORD]` with your actual password

4. **If your password has special characters**, URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `/` → `%2F`
   - `?` → `%3F`
   - `&` → `%26`

### Step 3: Test Database Connection

```bash
npx prisma db pull
```

**Expected output if successful:**

```
✔ Introspected X models and wrote them into prisma/schema.prisma
```

**If it fails:**

- Double-check the password in your DATABASE_URL
- Make sure there are no spaces or line breaks
- Try resetting the database password in Supabase

### Step 4: Initialize Database

Once connected, run these commands **in order**:

```bash
# 1. Push the schema to create all tables
npx prisma db push

# 2. Seed the database with initial data
npm run db:seed

# 3. Restart your development server
npm run dev
```

### Step 5: Create Supabase Auth Users

After seeding the database, create the authentication users:

1. Go to: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo/auth/users
2. Click **Add User** button

**Admin User:**

- Email: `admin@gengobot.com`
- Password: `admin123` (or your choice)
- ✅ Check "Auto Confirm User"
- Click **Create User**

**Student User:**

- Email: `student@gengobot.com`
- Password: `student123` (or your choice)
- ✅ Check "Auto Confirm User"
- Click **Create User**

### Step 6: Configure Supabase URL Settings

1. Go to: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo/auth/url-configuration
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/**`
4. Under **Email Auth** settings, disable email confirmations for development
5. Click **Save**

## ✅ Verification Checklist

After completing all steps:

- [ ] `npx prisma db pull` works without errors
- [ ] `npm run db:seed` completes successfully
- [ ] Dev server starts: `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can login with admin@gengobot.com
- [ ] Can login with student@gengobot.com
- [ ] Admin can access `/admin`
- [ ] Student redirects from `/admin` to `/dashboard`
- [ ] Tasks page loads without errors
- [ ] No "authentication failed" errors in console

## 🔍 Troubleshooting

### Error: "Authentication failed against database server"

**Cause**: Incorrect database password in DATABASE_URL

**Fix:**

1. Reset your database password in Supabase
2. Update DATABASE_URL in `.env.local`
3. Restart your dev server

### Error: "tasks.map is not a function"

**Status**: ✅ Already fixed!

- The API response structure has been corrected in TasksClient.tsx

### Error: "User not found" after login

**Cause**: Database not seeded or Auth users not created

**Fix:**

1. Run `npm run db:seed`
2. Create Auth users in Supabase dashboard (Step 5 above)

### Error: CORS errors on login

**Cause**: Supabase URL configuration not set

**Fix:**

1. Follow Step 6 above to configure Supabase URLs
2. Clear browser cookies for localhost
3. Restart dev server

## 📚 Additional Resources

- [GET_DATABASE_URL.md](GET_DATABASE_URL.md) - Detailed database connection guide
- [RESEED_GUIDE.md](RESEED_GUIDE.md) - Complete database reseeding instructions
- [AUTH_SUMMARY.md](AUTH_SUMMARY.md) - Authentication system documentation
- [TEST_ACCOUNTS.md](TEST_ACCOUNTS.md) - Test account information

## 🎯 Quick Start Commands

```bash
# 1. Update DATABASE_URL in .env.local first!

# 2. Test connection
npx prisma db pull

# 3. Initialize database
npx prisma db push
npm run db:seed

# 4. Start app
npm run dev

# 5. Create auth users in Supabase dashboard
# 6. Configure Supabase URL settings
# 7. Test login at http://localhost:3000/login
```

## Need Help?

If you're still experiencing issues:

1. Check the error in your browser console
2. Check the terminal where your dev server is running
3. Verify all environment variables are set correctly
4. Make sure Supabase project is not paused

# Database Reseed Guide - After Supabase Data Loss

## Step 1: Get Your Supabase Database Password

1. Go to your Supabase Dashboard: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo
2. Click on **Project Settings** (gear icon in the left sidebar)
3. Click on **Database** in the settings menu
4. Scroll down to **Connection string** section
5. Select the **URI** tab
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
   ```
7. Copy the password part from `[YOUR-PASSWORD]`

## Step 2: Update Your .env.local File

1. Open your `.env.local` file
2. Replace `[YOUR-SUPABASE-DB-PASSWORD]` with the actual password you copied
3. The line should look like:
   ```
   DATABASE_URL=postgresql://postgres:your_actual_password@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
   ```
4. Save the file

## Step 3: Push Database Schema to Supabase

Run this command to recreate all database tables:

```bash
npx prisma db push --force-reset
```

This will:

- Delete all existing tables (if any)
- Create fresh tables based on your schema
- Generate Prisma Client

## Step 4: Seed the Database

Run this command to populate the database with initial data:

```bash
npm run db:seed
```

This will create:

- ✅ 7 task categories (Restaurant, Shopping, Travel, Business, Healthcare, Daily Life, Education)
- ✅ 5 sample tasks
- ✅ 2 database users (admin@gengobot.com and student@gengobot.com)

## Step 5: Create Supabase Auth Users

Now you need to create the authentication users in Supabase:

### 5a. Create Admin User

1. Go to Supabase Dashboard: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo
2. Click **Authentication** in the left sidebar
3. Click the **Users** tab
4. Click **Add User** button
5. Fill in:
   - **Email**: `admin@gengobot.com`
   - **Password**: `admin123` (or your preferred password)
   - ✅ **Check "Auto Confirm User"**
6. Click **Create User**

### 5b. Create Student User

1. Click **Add User** button again
2. Fill in:
   - **Email**: `student@gengobot.com`
   - **Password**: `student123` (or your preferred password)
   - ✅ **Check "Auto Confirm User"**
3. Click **Create User**

## Step 6: Configure Supabase Authentication Settings (Important!)

To avoid CORS errors and authentication issues:

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
4. Scroll down to **Email Auth** settings
5. For development, you can disable email confirmation:
   - Uncheck **"Enable email confirmations"**
6. Click **Save**

## Step 7: Verify Everything Works

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Test Admin Login:
   - Go to `/login`
   - Email: `admin@gengobot.com`
   - Password: `admin123` (or what you set)
   - Should redirect to `/dashboard`
   - Navigate to `/admin` - should work

4. Test Student Login:
   - Sign out
   - Login with: `student@gengobot.com` / `student123`
   - Should redirect to `/dashboard`
   - Try to access `/admin` - should redirect back to `/dashboard`

## What Data Gets Created

### Task Categories (7):

1. 🍜 Restaurant - Dining and food ordering
2. 🛍️ Shopping - Retail scenarios
3. ✈️ Travel - Transportation scenarios
4. 💼 Business - Professional scenarios
5. 🏥 Healthcare - Medical scenarios
6. 🏠 Daily Life - Daily routines
7. 📚 Education - Academic scenarios

### Sample Tasks (5):

1. **Ordering Ramen** (N5 - Restaurant)
2. **Buying Clothes** (N4 - Shopping)
3. **Asking for Directions** (N5 - Travel)
4. **Doctor's Appointment** (N3 - Healthcare)
5. **Job Interview** (N2 - Business)

### Users (2):

- **admin@gengobot.com** - Admin with N1 proficiency
- **student@gengobot.com** - Student with N5 proficiency

## Troubleshooting

### "Can't reach database server" Error

- Double-check your DATABASE_URL in `.env.local`
- Make sure you replaced `[YOUR-SUPABASE-DB-PASSWORD]` with actual password
- Verify the password doesn't have special characters that need URL encoding

### "User not found" After Login

- Make sure you created the Supabase Auth users (Step 5)
- Email addresses must match exactly: `admin@gengobot.com` and `student@gengobot.com`

### CORS Errors on Login

- Follow Step 6 to configure Supabase Authentication settings
- Clear browser cache and cookies
- Restart your dev server

### No Tasks Showing Up

- Run `npm run db:seed` again
- Check database connection with: `npx prisma studio`
- Verify DATABASE_URL is correct

## Quick Reset (If Needed)

If you need to start over completely:

```bash
# 1. Reset database schema and seed
npx prisma db push --force-reset
npm run db:seed

# 2. Delete Supabase Auth users from dashboard
# 3. Recreate Supabase Auth users (Step 5)
```

## Useful Commands

```bash
# Open Prisma Studio (visual database editor)
npm run db:studio

# Generate Prisma Client after schema changes
npm run db:generate

# Check database connection
npx prisma db pull
```

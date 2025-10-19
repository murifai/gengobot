# Test Accounts Setup Guide

## Database Setup Complete ✅

The database has been populated with:

- ✅ 2 test user accounts (admin + student)
- ✅ 7 task categories
- ✅ 5 sample tasks

## Next Steps: Create Supabase Auth Users

To complete the setup, you need to create the authentication users in Supabase:

### 1. Access Supabase Dashboard

Go to: https://ynwhzzpeeaouejimjmwo.supabase.co

### 2. Navigate to Authentication

- Click on **Authentication** in the left sidebar
- Click on **Users** tab

### 3. Create Admin Account

Click **"Add User"** button and fill in:

- **Email**: `admin@gengobot.com`
- **Password**: `admin123` (or choose your own)
- ✅ Check **"Auto Confirm User"**
- Click **Create User**

### 4. Create Student Account

Click **"Add User"** button again and fill in:

- **Email**: `student@gengobot.com`
- **Password**: `student123` (or choose your own)
- ✅ Check **"Auto Confirm User"**
- Click **Create User**

## Test Account Credentials

### Admin Account

```
Email: admin@gengobot.com
Password: admin123
Role: Administrator
Proficiency: N1
```

**Admin Features:**

- ✅ Access to `/admin` panel
- ✅ Task management (create, edit, delete)
- ✅ User management
- ✅ Character management (all characters)
- ✅ Admin logs and analytics
- ✅ All student features

**Admin Panel Routes:**

- `/admin` - Admin dashboard
- `/admin/tasks` - Task management
- `/admin/characters` - Character management
- `/admin/settings` - Admin settings

---

### Student Account

```
Email: student@gengobot.com
Password: student123
Role: Student
Proficiency: N5
Preferred Categories: Restaurant, Shopping, Travel
```

**Student Features:**

- ✅ Task-based learning
- ✅ Free chat mode
- ✅ Progress tracking
- ✅ Voice practice (coming soon)
- ✅ Personal character management
- ✅ Profile settings
- ❌ NO access to `/admin` panel

**Student Dashboard Routes:**

- `/dashboard` - Main dashboard
- `/dashboard/tasks` - Available tasks
- `/dashboard/chat` - Free chat with characters
- `/dashboard/progress` - Learning progress
- `/dashboard/voice` - Voice practice
- `/dashboard/characters` - Manage characters
- `/dashboard/settings` - Profile settings

## Testing the Differences

### As Admin:

1. Login with admin credentials
2. Navigate to `/admin` - Should have full access
3. See "Admin Panel" link in navigation
4. Can manage all tasks and users

### As Student:

1. Login with student credentials
2. Navigate to `/admin` - Should redirect to `/dashboard`
3. No "Admin Panel" link in navigation
4. Can only access learning features

## Sample Data Included

### Task Categories (7):

1. 🍜 Restaurant - Dining and food ordering scenarios
2. 🛍️ Shopping - Retail and shopping scenarios
3. ✈️ Travel - Transportation and travel scenarios
4. 💼 Business - Professional and workplace scenarios
5. 🏥 Healthcare - Medical and health scenarios
6. 🏠 Daily Life - Daily routines and social interactions
7. 📚 Education - Academic and school scenarios

### Sample Tasks (5):

1. **Ordering Ramen at a Restaurant** (N5 - Restaurant)
2. **Buying Clothes at a Department Store** (N4 - Shopping)
3. **Asking for Directions to the Station** (N5 - Travel)
4. **Making a Doctor's Appointment** (N3 - Healthcare)
5. **Self-Introduction in a Job Interview** (N2 - Business)

## Verification Checklist

After creating the Supabase auth users:

- [ ] Login as admin@gengobot.com works
- [ ] Login as student@gengobot.com works
- [ ] Admin can access `/admin` panel
- [ ] Student redirected from `/admin` to `/dashboard`
- [ ] Both can see tasks in `/dashboard/tasks`
- [ ] Both can access their own settings
- [ ] Admin sees different navigation than student

## Troubleshooting

### "User not found" error after login

- Make sure you created the Supabase auth users
- Check that emails match exactly: `admin@gengobot.com` and `student@gengobot.com`

### "Access denied" when accessing admin

- This is expected for student account
- Only admin account can access `/admin` routes

### No tasks showing up

- Run `npm run db:seed` again to populate sample tasks
- Check database connection in `.env.local`

## Re-running Setup

To reset and recreate everything:

```bash
# Reset database and re-seed
npm run db:reset

# Create database users again
npm run users:create-db
```

Then recreate the Supabase auth users following steps above.

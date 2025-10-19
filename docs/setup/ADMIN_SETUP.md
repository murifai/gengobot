# Admin Access Setup

This guide explains how to set up and access the admin dashboard for GengoBot.

## Prerequisites

- Database must be running and migrated
- User must have a Supabase account created

## Making a User Admin

### Method 1: Using the Script (Recommended)

Run the following command to make a user an admin:

```bash
npx ts-node scripts/make-admin.ts <email@example.com>
```

**Example:**

```bash
npx ts-node scripts/make-admin.ts admin@example.com
```

This will:

- Create a new user with admin privileges if the email doesn't exist
- Update an existing user to grant admin privileges

### Method 2: Direct Database Update

If you prefer to update the database directly:

```sql
-- Update existing user
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';

-- Or create new admin user
INSERT INTO "User" (id, email, "isAdmin", proficiency, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'admin@example.com', true, 'N5', NOW(), NOW());
```

### Method 3: Prisma Studio

1. Open Prisma Studio:

   ```bash
   npm run db:studio
   ```

2. Navigate to the `User` table
3. Find your user by email
4. Set `isAdmin` field to `true`
5. Save the changes

## Accessing Admin Dashboard

1. **Sign up or log in** at `/login` with your email
2. After authentication, navigate to `/admin`
3. You'll see the admin dashboard with:
   - Analytics
   - User Management
   - Character Management
   - Settings

## Admin Routes

All admin routes are protected and require:

1. Valid authentication (Supabase session)
2. `isAdmin = true` in the database

Protected admin routes:

- `/admin` - Admin homepage
- `/admin/analytics` - System analytics
- `/admin/users` - User management
- `/admin/characters` - Character management
- `/admin/settings` - Application settings

## Security Features

- **Middleware Protection**: All `/admin/*` routes check for admin status
- **Server-Side Verification**: Admin status is verified on the server
- **Database-Level Control**: Admin flag stored in PostgreSQL
- **Auto-Redirect**: Non-admin users are redirected to `/dashboard`

## Troubleshooting

### "Access Denied" when accessing `/admin`

**Causes:**

1. User is not authenticated
2. User's `isAdmin` field is `false` in the database
3. Email mismatch between Supabase and database

**Solutions:**

1. Verify you're logged in
2. Run the make-admin script with your email
3. Check database for user with your email address

### Script Error: "User not found"

This is normal! The script will create a new user if they don't exist.

### Can't access after running script

1. Sign out completely
2. Sign back in
3. Clear browser cache if needed
4. Check database to confirm `isAdmin = true`

## First-Time Setup

For the first admin user:

```bash
# 1. Create your Supabase account at /login
# 2. Make yourself admin
npx ts-node scripts/make-admin.ts your-email@example.com

# 3. Refresh the page or log out and back in
# 4. Navigate to /admin
```

## Multiple Admins

You can have multiple admin users. Simply run the script for each email:

```bash
npx ts-node scripts/make-admin.ts admin1@example.com
npx ts-node scripts/make-admin.ts admin2@example.com
npx ts-node scripts/make-admin.ts admin3@example.com
```

## Removing Admin Access

To remove admin access from a user:

```sql
UPDATE "User" SET "isAdmin" = false WHERE email = 'user@example.com';
```

Or use Prisma Studio to set `isAdmin` to `false`.

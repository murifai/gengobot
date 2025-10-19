# How to Get Your Supabase Database URL

## Quick Steps:

1. **Go to Supabase Dashboard**: https://app.supabase.com/project/ynwhzzpeeaouejimjmwo

2. **Navigate to Project Settings**:
   - Click the **Settings** icon (gear) in the left sidebar
   - Click **Database** in the settings menu

3. **Find Connection String**:
   - Scroll down to the **Connection string** section
   - Click the **URI** tab
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
     ```

4. **Copy the Complete URL**:
   - Click the **Copy** button to copy the entire connection string
   - The password is already included in the URL

5. **Update Your .env.local File**:
   Replace this line:

   ```
   DATABASE_URL=postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres
   ```

   With the actual connection string you copied (it should have your real password instead of `[YOUR-PASSWORD]`)

6. **Restart Your Dev Server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Alternative: Reset Database Password

If you don't know your database password, you can reset it:

1. Go to https://app.supabase.com/project/ynwhzzpeeaouejimjmwo/settings/database
2. Scroll to **Database password** section
3. Click **Reset database password**
4. Copy the new password
5. Update your DATABASE_URL with the new password

## Test the Connection

After updating `.env.local`, test the connection:

```bash
npx prisma db pull
```

If it works, you'll see:

```
✔ Introspected 7 models and wrote them into prisma/schema.prisma
```

If it fails, double-check:

- The password in your DATABASE_URL is correct
- There are no extra spaces or line breaks
- The URL format is exactly: `postgresql://postgres:YOUR_PASSWORD@db.ynwhzzpeeaouejimjmwo.supabase.co:5432/postgres`

## Common Issues:

### Special Characters in Password

If your password contains special characters like `@`, `#`, `$`, `%`, you need to URL-encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `&` becomes `%26`

### Example:

If password is `my@pass#word`, use: `my%40pass%23word` in the URL

## Once Connected:

After you get the database connected, run these commands in order:

```bash
# 1. Push the schema to create tables
npx prisma db push

# 2. Seed the database with initial data
npm run db:seed

# 3. Restart your dev server
npm run dev
```

Then you'll need to create the Supabase Auth users as described in [RESEED_GUIDE.md](RESEED_GUIDE.md).

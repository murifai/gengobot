# Fix Production Database Permission Issue

## Problem
Users cannot login in production due to PostgreSQL error:
```
Error: permission denied for schema public
PostgreSQL error code: 42501
```

## Root Cause
The database user configured in `DATABASE_URL` doesn't have the necessary permissions to access tables in the `public` schema.

## Solution

### Step 1: Identify Your Database User

Check your production `DATABASE_URL` environment variable:
```bash
# On your production server
echo $DATABASE_URL
# Or check the .env file
cat /var/www/gengobot/.env | grep DATABASE_URL
```

Example format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE`

Extract the **USERNAME** from the connection string.

### Step 2: Connect to PostgreSQL as Superuser

Connect to your database as a superuser (usually `postgres`):

```bash
# If you have sudo access
sudo -u postgres psql -d gengobot

# Or if you're using a remote database
psql -h YOUR_HOST -U postgres -d gengobot
```

### Step 3: Grant Permissions

Run the following SQL commands, replacing `YOUR_DB_USER` with the username from Step 1:

```sql
-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO YOUR_DB_USER;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO YOUR_DB_USER;

-- Grant all privileges on all sequences (for ID generation)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO YOUR_DB_USER;

-- Grant all privileges on all functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO YOUR_DB_USER;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO YOUR_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO YOUR_DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO YOUR_DB_USER;

-- Grant CREATE permission (needed for migrations)
GRANT CREATE ON SCHEMA public TO YOUR_DB_USER;
```

### Step 4: Verify Permissions

Check that permissions were granted:

```sql
-- Check table privileges
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee = 'YOUR_DB_USER';

-- Check schema privileges
SELECT nspname, nspacl
FROM pg_namespace
WHERE nspname = 'public';
```

### Step 5: Restart Your Application

```bash
# On production server
pm2 restart gengobot
```

### Step 6: Test Login

Try logging in again. The error should be resolved.

## Alternative: Quick Fix Script

If you have the SQL file, you can run it directly:

```bash
# Edit the script first to replace 'your_db_user' with your actual username
vim /var/www/gengobot/scripts/fix-db-permissions.sql

# Then execute it
sudo -u postgres psql -d gengobot -f /var/www/gengobot/scripts/fix-db-permissions.sql
```

## Common Issues

### Issue: "role YOUR_DB_USER does not exist"
**Solution**: Create the user first:
```sql
CREATE USER YOUR_DB_USER WITH PASSWORD 'your_password';
```

### Issue: Still getting permission denied after grants
**Solution**: The schema might have been created by a different user. Transfer ownership:
```sql
ALTER SCHEMA public OWNER TO YOUR_DB_USER;
```

### Issue: Can't connect as postgres superuser
**Solution**: Reset postgres password or use your database provider's admin panel (if using managed PostgreSQL like AWS RDS, DigitalOcean, etc.)

## Prevention

To avoid this issue in the future:

1. **When creating a new database user**, always grant proper permissions immediately:
   ```sql
   CREATE USER myuser WITH PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE gengobot TO myuser;
   GRANT ALL PRIVILEGES ON SCHEMA public TO myuser;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myuser;
   ```

2. **After running Prisma migrations**, verify permissions:
   ```bash
   npx prisma db pull
   ```

3. **Document your database setup** in your deployment documentation

## Need Help?

If you're still experiencing issues:
1. Check the application logs: `pm2 logs gengobot`
2. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
3. Verify your DATABASE_URL is correct: `echo $DATABASE_URL`

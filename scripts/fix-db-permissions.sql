-- Fix PostgreSQL permissions for gengobot database user
-- This script grants necessary permissions to the database user

-- Replace 'your_db_user' with the actual database username from your DATABASE_URL
-- Example: If DATABASE_URL=postgresql://gengobot_user:password@localhost:5432/gengobot
-- Then replace 'your_db_user' with 'gengobot_user'

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO your_db_user;

-- Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;

-- Grant all privileges on all sequences (for ID generation)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Grant all privileges on all functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO your_db_user;

-- Set default privileges for future tables, sequences, and functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO your_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO your_db_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO your_db_user;

-- If you want to grant permissions to create tables (needed for migrations)
GRANT CREATE ON SCHEMA public TO your_db_user;

-- Verify the grants were applied
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND grantee = 'your_db_user'
LIMIT 10;

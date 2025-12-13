-- Separate Admin and User deck ownership
-- 1. Remove isAdmin from User table
-- 2. Add createdByAdmin to Deck table
-- 3. Update AdminLog to reference Admin instead of User

-- Step 1: Add createdByAdmin column to Deck
ALTER TABLE "Deck" ADD COLUMN "createdByAdmin" TEXT;

-- Step 2: Make createdBy nullable (for admin-created decks)
ALTER TABLE "Deck" ALTER COLUMN "createdBy" DROP NOT NULL;

-- Step 3: Create index for createdByAdmin
CREATE INDEX "Deck_createdByAdmin_idx" ON "Deck"("createdByAdmin");

-- Step 4: Add foreign key for createdByAdmin -> Admin
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_createdByAdmin_fkey" FOREIGN KEY ("createdByAdmin") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop AdminLog foreign key to User
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_adminId_fkey";

-- Step 6: Update existing AdminLog records to use the first Admin ID
-- (This migrates old User-based adminId to actual Admin ID)
UPDATE "AdminLog" SET "adminId" = (SELECT "id" FROM "Admin" LIMIT 1) WHERE "adminId" IS NOT NULL;

-- Step 7: Add AdminLog foreign key to Admin
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Remove isAdmin index from User
DROP INDEX IF EXISTS "User_isAdmin_idx";

-- Step 9: Remove isAdmin column from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "isAdmin";

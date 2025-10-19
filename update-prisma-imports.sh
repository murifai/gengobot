#!/bin/bash

# Script to update all files to use centralized Prisma client
# This ensures consistent database connection across the application

echo "🔄 Updating Prisma imports to use centralized client..."

# Files to update
files=(
  "src/lib/storage/userProgressTracking.ts"
  "src/lib/storage/conversationStorage.ts"
  "src/lib/storage/taskAttemptPersistence.ts"
  "src/lib/export/dataExport.ts"
  "src/lib/backup/backupRecovery.ts"
  "src/lib/analytics/taskAnalytics.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Updating $file"

    # Replace import statement
    sed -i.bak "s/import { PrismaClient } from '@prisma\/client';/import { prisma } from '@\/lib\/prisma';/g" "$file"

    # Remove the const prisma = new PrismaClient() line
    sed -i.bak "/^const prisma = new PrismaClient();$/d" "$file"
    sed -i.bak "/^const prisma = new PrismaClient()$/d" "$file"

    # Remove empty lines that might have been left
    sed -i.bak '/^$/N;/^\n$/d' "$file"

    echo "  ✅ Updated $file"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ All files updated!"
echo ""
echo "📋 Next steps:"
echo "  1. Update your DATABASE_URL in .env.local with your Supabase credentials"
echo "  2. Run: npx prisma db push"
echo "  3. Run: npm run db:seed"
echo "  4. Restart your dev server: npm run dev"

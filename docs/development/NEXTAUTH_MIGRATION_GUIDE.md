# NextAuth.js Migration Guide

## Migration Status

This project has been migrated from Supabase Auth to NextAuth.js v5.

### Completed Steps

1. ✅ Installed NextAuth.js v5 and dependencies
2. ✅ Updated Prisma schema with NextAuth tables (Account, Session, VerificationToken)
3. ✅ Created NextAuth configuration and auth.ts setup
4. ✅ Updated middleware to use NextAuth session management
5. ✅ Created auth context provider replacing Supabase
6. ✅ Updated environment variables (.env and .env.example)
7. ✅ Created authentication helper functions

### Remaining Tasks

- [ ] Update all API routes to use NextAuth session
- [ ] Test authentication flow end-to-end
- [ ] Remove Supabase dependencies from package.json
- [ ] Delete Supabase client files

## API Route Migration Pattern

### Old Pattern (Supabase)

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use user.email, user.id
}
```

### New Pattern (NextAuth)

```typescript
import { getCurrentSessionUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use sessionUser.email, sessionUser.id, sessionUser.isAdmin
}
```

## Helper Functions Available

### `/lib/auth/session.ts`

- `getSession()` - Get current session
- `getCurrentSessionUser()` - Get current user from session
- `getCurrentUserFromSession()` - Get full user from database
- `requireAuth()` - Throws if not authenticated
- `requireAdmin()` - Throws if not admin

### `/lib/auth/helpers.ts`

- `getCurrentUser()` - Get current user
- `getCurrentUserFromDB()` - Get current user with full DB details
- `isAdmin()` - Check if current user is admin
- `createUser()` - Create new user with hashed password
- `verifyCredentials()` - Verify user credentials

### `/lib/auth/admin.ts`

- `isAdmin()` - Check if current user is admin
- `isUserAdmin(userId)` - Check if specific user is admin
- `getCurrentUserWithRole()` - Get current user with role
- `setAdminStatus(userId, status)` - Set admin status

## Files to Update

Find all files that import from `@/lib/supabase/server` or `@/lib/supabase/client`:

```bash
grep -r "from '@/lib/supabase" src/ --include="*.ts" --include="*.tsx"
```

## Authentication Flow

### Sign Up

1. User submits form → `/api/auth/register`
2. Password is hashed with bcrypt
3. User created in database
4. Auto sign-in with NextAuth credentials provider

### Sign In

1. User submits form → NextAuth credentials provider
2. Password verified with bcrypt
3. JWT session created
4. Session stored in cookie

### Sign Out

1. User clicks sign out → `signOut()` from next-auth/react
2. Session destroyed
3. Redirect to login page

## Database Changes

### User Model

- Removed: `authId` (Supabase auth user ID)
- Added: `password` (hashed), `emailVerified`, `image`
- Added relations: `accounts`, `sessions`

### New Models

- `Account` - OAuth accounts (for future providers)
- `Session` - Session tokens
- `VerificationToken` - Email verification tokens

## Environment Variables

```env
# OLD (Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# NEW (NextAuth)
NEXTAUTH_SECRET=kTJsZr8DOtCWyVf7GdJyB+xESsfqZvfV93ac0WzFFzk=
NEXTAUTH_URL=http://localhost:3000
```

## Testing Checklist

- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Access protected dashboard routes
- [ ] Access admin routes (as admin)
- [ ] Update user profile
- [ ] API routes require authentication
- [ ] Middleware redirects work correctly

## Rollback Plan

If issues arise, the migration can be rolled back by:

1. Restoring Prisma schema from git
2. Reinstalling Supabase packages
3. Restoring middleware and auth context
4. Running database migration rollback

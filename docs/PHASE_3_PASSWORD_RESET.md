# Phase 3: Password Reset - Implementation Complete

**Status:** ✅ COMPLETED
**Date:** November 16, 2025
**Effort:** ~3 hours

---

## Overview

Phase 3 implements a complete password reset flow using the Mailjet email infrastructure from Phase 2. Users can request a password reset link via email and securely set a new password.

---

## What Was Implemented

### 1. Database Schema

**Changes to `prisma/schema.prisma`:**

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  usedAt    DateTime?

  @@index([email])
  @@index([token])
}
```

**Migration:**

- Schema pushed to database using `npx prisma db push`
- `PasswordResetToken` table created
- Indexed fields for fast lookups

### 2. Token Management

**File Created:**

- `src/lib/auth/password-reset-token.ts`

**Functions:**

- `createPasswordResetToken(email)` - Generate secure token with 1h expiry
- `verifyPasswordResetToken(token)` - Validate token and return email
- `markTokenAsUsed(token)` - Mark token as consumed
- `deletePasswordResetToken(token)` - Clean up after use
- `cleanupExpiredResetTokens()` - Periodic cleanup utility
- `hasPendingPasswordReset(email)` - Check pending status

**Security Features:**

- Cryptographically secure random tokens (32 bytes, hex encoded)
- **1-hour expiration** (stricter than email verification)
- One-time use tokens
- Automatic cleanup of expired tokens
- Prevention of token reuse

### 3. Rate Limiting

**Updated File:**

- `src/lib/rate-limit/memory.ts` (already included `resetPasswordRateLimit`)

**Rate Limit:**

- 3 password reset requests per hour per email
- Prevents abuse and enumeration attacks
- User-friendly error messages with time remaining

### 4. API Endpoints

**Created:**

1. **POST `/api/auth/forgot-password`**
   - Accepts email address
   - Rate limited (3 requests/hour)
   - Generates password reset token
   - Sends reset email via Mailjet
   - Generic responses (prevents email enumeration)
   - Handles OAuth-only accounts gracefully

2. **POST `/api/auth/reset-password`**
   - Accepts token and new password
   - Validates password strength
   - Verifies token validity
   - Updates user password (bcrypt hashed)
   - Marks token as used
   - Cleans up token after success

### 5. User Interface

**Files Created:**

1. **`src/app/forgot-password/page.tsx`**
   - Forgot password form
   - Email input with validation
   - Success state with instructions
   - "Send another reset link" option
   - Security notice about enumeration

2. **`src/app/reset-password/page.tsx`**
   - Password reset form with token validation
   - New password + confirm password fields
   - Password strength requirements display
   - Real-time password validation
   - Success state with auto-redirect
   - Invalid token error handling

**Files Updated:** 3. **`src/app/login/page.tsx`**

- Added "Forgot password?" link (only shown in login mode)
- Success message after password reset (`?reset=success`)
- Indonesian language support ("Lupa kata sandi?")

### 6. Email Template

**Already Implemented in Phase 2:**

- `sendPasswordResetEmail()` in `src/lib/email/mailjet.ts`
- Professional HTML email template
- Clear call-to-action button
- 1-hour expiration notice
- Plain text fallback

---

## User Flow

### Password Reset Flow

1. **User requests reset** → Navigate to `/forgot-password`
2. **Enter email** → Click "Send Reset Link"
3. **Rate limit check** → 3 requests/hour validation
4. **Token generated** → 1-hour expiry
5. **Email sent** → Mailjet API
6. **User receives email** → Click reset link
7. **Redirects to** → `/reset-password?token=xxx`
8. **Enter new password** → Password validation
9. **Token verified** → POST `/api/auth/reset-password`
10. **Password updated** → Bcrypt hash
11. **Token consumed** → Mark as used and delete
12. **Redirect to login** → `/login?reset=success`

### Alternative Flows

**From Login Page:**

```
Login Failed → Click "Lupa kata sandi?" → Forgot Password Page
```

**Token Expired:**

```
Click Reset Link → Invalid Token Error → "Request New Reset Link" Button
```

**Rate Limited:**

```
3rd Request → Wait 1 hour → Try Again
```

---

## Security Features

### 1. Token Security

- ✅ Cryptographically secure random generation
- ✅ 64-character hex tokens (32 bytes)
- ✅ Unique database constraint
- ✅ **1-hour expiration** (stricter than email verification)
- ✅ One-time use (marked as used, then deleted)

### 2. Rate Limiting

- ✅ 3 password reset requests per hour per email
- ✅ In-memory rate limiting with automatic cleanup
- ✅ User-friendly error messages

### 3. Attack Prevention

- ✅ **No email enumeration** (generic responses for all cases)
- ✅ Token reuse prevention (usedAt timestamp)
- ✅ Expired token auto-deletion
- ✅ OAuth account protection (no password reset for social login)
- ✅ Password strength validation
- ✅ Graceful error handling

### 4. Password Validation

- ✅ Minimum 8 characters
- ✅ Uppercase and lowercase letters
- ✅ At least one number
- ✅ At least one special character
- ✅ Bcrypt hashing with cost factor 10

---

## Testing Checklist

### Manual Testing

- [ ] **Forgot password flow**
  1. Go to `/login`
  2. Click "Lupa kata sandi?"
  3. Enter email address
  4. Should receive reset email
  5. Check Mailjet dashboard if email doesn't arrive

- [ ] **Reset password link**
  1. Click link in reset email
  2. Should redirect to `/reset-password?token=xxx`
  3. Enter new password (meet all requirements)
  4. Confirm password
  5. Submit form
  6. Should redirect to login with success message

- [ ] **Login with new password**
  1. After reset, try to login
  2. Should succeed with new password
  3. Old password should no longer work

- [ ] **Rate limiting**
  1. Request reset 3 times quickly
  2. 4th request should fail with rate limit error
  3. Error message should show time remaining

- [ ] **Expired token**
  1. Get reset link
  2. Wait 1+ hour (or manually expire in DB)
  3. Try to use link
  4. Should show "Invalid or expired" error

- [ ] **Token reuse prevention**
  1. Complete password reset
  2. Try to use same token again
  3. Should fail with invalid token error

- [ ] **OAuth account protection**
  1. Request reset for OAuth-only account
  2. Should receive generic success message
  3. No email should be sent
  4. Check server logs for warning

- [ ] **Password validation**
  1. Try weak password (e.g., "12345678")
  2. Should show validation errors
  3. Try strong password
  4. Should succeed

### Database Testing

```sql
-- Check reset tokens
SELECT * FROM "PasswordResetToken";

-- Check user password hash changed
SELECT id, email, password, "updatedAt" FROM "User" WHERE email = 'test@example.com';

-- Manually expire a token (for testing)
UPDATE "PasswordResetToken"
SET expires = NOW() - INTERVAL '1 hour'
WHERE email = 'test@example.com';

-- Check token usage
SELECT email, "usedAt", expires FROM "PasswordResetToken" WHERE email = 'test@example.com';
```

### API Testing (Using curl)

```bash
# 1. Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Reset password (replace TOKEN)
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE","password":"NewSecurePass123!"}'
```

---

## Security Considerations

### Email Enumeration Prevention

**Problem:** Attackers could determine which emails are registered by observing different responses.

**Solution:**

- Always return the same generic success message
- "If an account exists with this email, a reset link has been sent"
- Don't reveal whether account exists or uses OAuth

### Token Expiration

**Why 1 hour?**

- Shorter window reduces risk of token theft
- Balances security with user convenience
- Industry standard for password reset

### OAuth Account Protection

**Problem:** OAuth users don't have passwords set.

**Solution:**

- Check if `user.password` is null
- Return generic success message
- Log warning for monitoring
- Don't send reset email

### Rate Limiting

**Why 3 per hour?**

- Prevents brute force attacks
- Limits email spam
- Reasonable for legitimate users
- Matches industry standards

---

## Troubleshooting

### Email Not Received

**Problem:** Password reset email not arriving

**Solutions:**

1. Check Mailjet dashboard → Statistics
2. Verify sender email in Mailjet
3. Check spam folder
4. Verify email exists in system
5. Check if account uses OAuth (no password)
6. Check server logs for errors

### Invalid Token Error

**Problem:** Reset link shows "Invalid or expired token"

**Solutions:**

1. Check token hasn't expired (1 hour limit)
2. Verify token exists in database
3. Check token wasn't already used
4. Request new reset link
5. Ensure token matches exactly (no truncation)

### Password Validation Fails

**Problem:** New password rejected

**Solutions:**

1. Ensure minimum 8 characters
2. Include uppercase AND lowercase letters
3. Include at least one number
4. Include at least one special character (!@#$%^&\*)
5. Check password validator rules

### Rate Limit Issues

**Problem:** "Too many requests" error

**Solutions:**

1. Wait until rate limit resets (shown in error)
2. Check if legitimate user behavior
3. Restart server to clear in-memory limits (dev only)
4. Adjust rate limits if needed for testing

---

## Performance Considerations

### Token Generation

- Fast cryptographic random generation
- Single database operation
- Automatic old token cleanup

### Email Sending

- Async operation via Mailjet
- Doesn't block request
- Returns immediately after sending

### Database Queries

- Indexed email and token fields
- Single query for validation
- Efficient token lookup
- Automatic cleanup prevents bloat

---

## Production Recommendations

### 1. Token Storage

- Consider Redis for distributed systems
- Current in-memory rate limiting resets on restart
- Database tokens persist correctly

### 2. Email Monitoring

- Monitor Mailjet delivery rates
- Set up alerts for failures
- Track reset request patterns

### 3. Security Monitoring

- Log failed reset attempts
- Alert on unusual patterns
- Monitor rate limit hits

### 4. User Experience

- Consider SMS as backup for critical accounts
- Implement account recovery questions
- Add 2FA for additional security layer

---

## Files Summary

### Created Files (7)

1. `src/lib/auth/password-reset-token.ts` - Token utilities
2. `src/app/api/auth/forgot-password/route.ts` - Request reset API
3. `src/app/api/auth/reset-password/route.ts` - Reset password API
4. `src/app/forgot-password/page.tsx` - Forgot password UI
5. `src/app/reset-password/page.tsx` - Reset password UI
6. `docs/PHASE_3_PASSWORD_RESET.md` - This documentation

### Updated Files (2)

1. `prisma/schema.prisma` - Added `PasswordResetToken` model
2. `src/app/login/page.tsx` - Added forgot password link and reset success message

### Email Template (Phase 2)

- `src/lib/email/mailjet.ts` - Already includes `sendPasswordResetEmail()`

---

## Completion Checklist

- [x] Database schema updated with PasswordResetToken model
- [x] Token generation and validation utilities created
- [x] Rate limiting implemented (3 requests/hour)
- [x] Forgot password API endpoint created
- [x] Reset password API endpoint created
- [x] Forgot password UI page created
- [x] Reset password UI page created
- [x] Login page updated with forgot password link
- [x] Password validation integrated
- [x] Email enumeration protection implemented
- [x] OAuth account protection implemented
- [x] TypeScript compilation successful (no errors)
- [x] Security features implemented
- [x] Documentation completed

---

## Comparison: Email Verification vs Password Reset

| Feature            | Email Verification | Password Reset |
| ------------------ | ------------------ | -------------- |
| **Token Expiry**   | 24 hours           | 1 hour         |
| **Rate Limit**     | 3/hour (resend)    | 3/hour         |
| **Security Level** | Medium             | High           |
| **Token Reuse**    | Prevented          | Prevented      |
| **After Use**      | Mark verified      | Delete token   |
| **Email Template** | Welcome focus      | Security focus |
| **User Impact**    | Can retry easily   | Time-sensitive |

---

## Integration with Phase 2

Phase 3 builds seamlessly on Phase 2 infrastructure:

✅ **Mailjet Service** - Reuses email infrastructure
✅ **Token Utilities** - Similar pattern to email verification
✅ **Rate Limiting** - Extends existing rate limit system
✅ **UI Patterns** - Consistent with email verification pages
✅ **Security Model** - Follows same best practices

---

## Next Steps

The authentication system is now feature-complete with:

- ✅ Registration with email verification (Phase 2)
- ✅ Password reset flow (Phase 3)
- ✅ Rate limiting on all auth endpoints (Phase 1)
- ✅ CSRF protection (Phase 1)
- ✅ Password strength validation (Phase 1)

**Optional Future Enhancements:**

1. Google OAuth integration (from original roadmap)
2. Two-factor authentication (2FA)
3. Account deletion with email confirmation
4. Email change workflow
5. Login notification emails
6. Session management improvements

---

## Support

For issues or questions:

- Check Mailjet dashboard for email delivery
- Review server logs for errors
- Test with curl/Postman for debugging
- Verify database token state

---

**Phase 3 Complete!** 🎉

The password reset system is fully functional and ready for testing.

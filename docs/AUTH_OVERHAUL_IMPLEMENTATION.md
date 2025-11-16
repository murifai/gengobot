# GengoBot Authentication Overhaul - Implementation Guide

> **Branch:** `feature/auth-overhaul`
> **Status:** In Progress
> **Framework:** NextAuth v5.0.0-beta.30
> **Total Effort:** ~53 hours (~7 working days)

---

## Table of Contents

1. [Overview](#overview)
2. [Current System Analysis](#current-system-analysis)
3. [Technology Stack](#technology-stack)
4. [Phase 1: Critical Security Fixes](#phase-1-critical-security-fixes-week-1)
5. [Phase 2: Email System](#phase-2-email-system-smtp2go-week-1-2)
6. [Phase 3: Password Reset](#phase-3-password-reset-week-2)
7. [Phase 4: Google OAuth](#phase-4-google-oauth-week-3)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Checklist](#deployment-checklist)
10. [Rollback Plan](#rollback-plan)

---

## Overview

### Goals

- ✅ Fix 8 critical security vulnerabilities
- ✅ Implement email verification system
- ✅ Add password reset flow
- ✅ Integrate Google OAuth
- ✅ Add rate limiting protection
- ✅ Strengthen password policies

### Key Decisions

| Component               | Technology       | Rationale                                       |
| ----------------------- | ---------------- | ----------------------------------------------- |
| **Auth Framework**      | NextAuth v5 beta | Already in use, stable, good Next.js 15 support |
| **Email Provider**      | SMTP2GO          | Free 1K/month, VPS-friendly, reliable           |
| **Rate Limiting**       | In-Memory        | Free, unlimited, fast, perfect for single VPS   |
| **Password Min Length** | 8 characters     | Balanced security + usability                   |
| **Session Strategy**    | JWT (30-day)     | Already implemented, scalable                   |

---

## Current System Analysis

### Strengths 🟢

- ✅ Secure bcryptjs password hashing (10 salt rounds)
- ✅ JWT-based sessions with httpOnly cookies
- ✅ TypeScript type safety throughout
- ✅ Server-side API route protection (38+ routes)
- ✅ Admin RBAC with database verification

### Critical Vulnerabilities 🔴

| Issue                    | Risk Level | Impact                       |
| ------------------------ | ---------- | ---------------------------- |
| No rate limiting         | CRITICAL   | Brute force attacks possible |
| Weak passwords (6 chars) | HIGH       | Easy to crack                |
| No email verification    | HIGH       | Fake accounts, enumeration   |
| Verbose error messages   | MEDIUM     | Email enumeration            |
| No password reset        | HIGH       | Users locked out permanently |
| Missing CSRF tokens      | MEDIUM     | CSRF attacks on registration |
| Unprotected API routes   | MEDIUM     | Information disclosure       |

### File Structure

```
src/
├── lib/auth/
│   ├── auth.ts              # NextAuth initialization
│   ├── config.ts            # Providers & callbacks
│   ├── helpers.ts           # User creation, verification
│   ├── session.ts           # Session utilities
│   └── admin.ts             # Admin role management
├── contexts/
│   └── AuthContext.tsx      # React auth context
├── app/
│   ├── login/page.tsx       # Login/register UI
│   ├── auth/error/page.tsx  # Error handling
│   └── api/
│       └── auth/
│           ├── register/route.ts
│           └── [...nextauth]/route.ts
└── middleware.ts            # Route protection
```

---

## Technology Stack

### Dependencies to Install

```bash
# Email service
npm install nodemailer @types/nodemailer

# Password strength validation
npm install zxcvbn @types/zxcvbn

# No additional packages needed for rate limiting (in-memory)
```

### Environment Variables

```env
# Existing
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=<key>

# NEW - Email (SMTP2GO)
EMAIL_SERVER_HOST=mail.smtp2go.com
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=<smtp2go-username>
EMAIL_SERVER_PASSWORD=<smtp2go-password>
EMAIL_FROM=noreply@yourdomain.com

# NEW - Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# NEW - App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=GengoBot
```

---

## Phase 1: Critical Security Fixes (Week 1)

**Effort:** 15 hours
**Priority:** IMMEDIATE

### 1.1 Generic Error Messages (2h)

**Problem:** Current errors leak user existence information.

#### Files to Modify

**File:** `/src/app/api/auth/register/route.ts`

```typescript
// ❌ BEFORE
if (existingUser) {
  return Response.json({ error: 'User already exists' }, { status: 400 });
}

// ✅ AFTER
if (existingUser) {
  // Log internally for monitoring
  console.warn(`[AUTH] Registration attempt with existing email: ${email}`);

  // Return generic success message (prevent enumeration)
  return Response.json(
    {
      message: 'Registration successful. Please check your email to verify your account.',
    },
    { status: 201 }
  );

  // TODO: Optionally send "account already exists" notification email
}
```

**File:** `/src/lib/auth/config.ts` (Credentials Provider)

```typescript
// ❌ BEFORE
if (!user) {
  throw new Error('User not found');
}
if (!isPasswordValid) {
  throw new Error('Invalid password');
}

// ✅ AFTER
if (!user || !isPasswordValid) {
  // Log with different codes for internal tracking
  console.warn(`[AUTH] Failed login attempt: ${user ? 'invalid_password' : 'user_not_found'}`, {
    email: credentials.email,
  });

  // Same error for both cases (prevent enumeration)
  throw new Error('Invalid email or password');
}
```

#### Testing Checklist

- [ ] Login with non-existent email returns "Invalid email or password"
- [ ] Login with wrong password returns "Invalid email or password"
- [ ] Registration with existing email returns generic success message
- [ ] Response times are consistent (within 50ms) for both scenarios

---

### 1.2 Strong Password Validation (3h)

**Requirements:**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: Check against common passwords

#### Step 1: Create Password Validator

**File:** `/src/lib/auth/password-validator.ts` (NEW)

```typescript
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-4
}

// Common weak passwords (top 100 most common)
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'password1',
  'Password1',
  // Add more from: https://github.com/danielmiessler/SecLists
];

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score++;
    if (password.length >= 12) score++; // Bonus for 12+
    if (password.length >= 16) score++; // Bonus for 16+
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  } else {
    score++;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  } else {
    score++;
  }

  // Special character check (optional, gives bonus points)
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score++;
  }

  // Common password check
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.');
    score = Math.max(0, score - 2);
  }

  // Calculate strength
  let strength: PasswordValidationResult['strength'];
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(4, score),
  };
}

// Optional: Server-side breach check using HaveIBeenPwned API
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const crypto = await import('crypto');
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    // Check if password hash suffix appears in breached list
    return text.includes(suffix);
  } catch (error) {
    console.error('[AUTH] Password breach check failed:', error);
    return false; // Fail open (don't block registration if API is down)
  }
}
```

#### Step 2: Update Registration API

**File:** `/src/app/api/auth/register/route.ts`

```typescript
import { validatePassword } from '@/lib/auth/password-validator';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name } = data;

    // Validate email and password presence
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // NEW: Validate password strength
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return Response.json(
        {
          error: 'Password does not meet security requirements',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Optional: Check against breach database
    // const isBreached = await checkPasswordBreach(password);
    // if (isBreached) {
    //   return Response.json(
    //     { error: 'This password has been exposed in a data breach. Please choose a different password.' },
    //     { status: 400 }
    //   );
    // }

    // ... rest of registration logic
  } catch (error) {
    // ... error handling
  }
}
```

#### Step 3: Update Credentials Provider

**File:** `/src/lib/auth/config.ts`

```typescript
// Add password validation to password changes
// (This will be used in password reset flow)
import { validatePassword } from '@/lib/auth/password-validator';

// In callbacks or password change handlers:
const validation = validatePassword(newPassword);
if (!validation.isValid) {
  throw new Error(validation.errors.join(', '));
}
```

#### Step 4: Frontend Password Strength Meter (Optional)

**File:** `/src/components/auth/PasswordStrengthMeter.tsx` (NEW)

```typescript
'use client';

import { validatePassword } from '@/lib/auth/password-validator';
import { useEffect, useState } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [validation, setValidation] = useState(validatePassword(''));

  useEffect(() => {
    if (password) {
      setValidation(validatePassword(password));
    }
  }, [password]);

  if (!password) return null;

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
    'very-strong': 'bg-blue-500',
  };

  const strengthWidth = {
    weak: 'w-1/4',
    medium: 'w-1/2',
    strong: 'w-3/4',
    'very-strong': 'w-full',
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColors[validation.strength]} ${strengthWidth[validation.strength]}`}
        />
      </div>

      {/* Strength label */}
      <p className="text-sm font-medium">
        Strength: <span className="capitalize">{validation.strength}</span>
      </p>

      {/* Validation errors */}
      {validation.errors.length > 0 && (
        <ul className="text-sm text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**File:** `/src/app/login/page.tsx` (Update)

```typescript
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

// In your registration form:
<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
<PasswordStrengthMeter password={password} />
```

#### Testing Checklist

- [ ] Password < 8 chars is rejected
- [ ] Password without uppercase is rejected
- [ ] Password without lowercase is rejected
- [ ] Password without number is rejected
- [ ] Common passwords (e.g., "password1") are rejected
- [ ] Valid password (e.g., "MyPass123") is accepted
- [ ] Frontend shows strength meter in real-time
- [ ] Error messages are clear and helpful

---

### 1.3 In-Memory Rate Limiting (3h)

**Features:**

- Login: 5 attempts per 15 minutes per email
- Registration: 3 attempts per hour per IP
- Password reset: 3 attempts per hour per email

#### Step 1: Create Rate Limiter

**File:** `/src/lib/rate-limit/memory.ts` (NEW)

```typescript
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check rate limit for a given key
   * @param key - Unique identifier (e.g., "login:user@example.com")
   * @param maxAttempts - Maximum allowed attempts
   * @param windowMs - Time window in milliseconds
   * @returns Result with success status and remaining attempts
   */
  async limit(key: string, maxAttempts: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // First attempt or expired window
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.store.set(key, {
        count: 1,
        resetAt,
      });
      return {
        success: true,
        remaining: maxAttempts - 1,
        resetAt,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    return {
      success: true,
      remaining: maxAttempts - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key (useful for successful actions)
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RATE_LIMIT] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Get current status for debugging
   */
  getStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new MemoryRateLimiter();

// Convenience functions for different rate limit types
export async function loginRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `login:${email.toLowerCase()}`,
    5, // 5 attempts
    15 * 60 * 1000 // 15 minutes
  );
}

export async function registerRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `register:${ip}`,
    3, // 3 attempts
    60 * 60 * 1000 // 1 hour
  );
}

export async function resetPasswordRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `reset:${email.toLowerCase()}`,
    3, // 3 attempts
    60 * 60 * 1000 // 1 hour
  );
}

export async function verifyEmailRateLimit(email: string): Promise<RateLimitResult> {
  return rateLimiter.limit(
    `verify:${email.toLowerCase()}`,
    5, // 5 resends
    60 * 60 * 1000 // 1 hour
  );
}

// Helper to format time remaining
export function formatTimeRemaining(resetAt: number): string {
  const minutes = Math.ceil((resetAt - Date.now()) / 60000);
  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}
```

#### Step 2: Apply to Login (Credentials Provider)

**File:** `/src/lib/auth/config.ts`

```typescript
import { loginRateLimit, formatTimeRemaining, rateLimiter } from '@/lib/rate-limit/memory';

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // NEW: Rate limit check BEFORE database query
        const rateLimit = await loginRateLimit(email);

        if (!rateLimit.success) {
          const timeRemaining = formatTimeRemaining(rateLimit.resetAt);
          throw new Error(`Too many login attempts. Please try again in ${timeRemaining}.`);
        }

        // Verify credentials
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // NEW: Reset rate limit on successful login
        rateLimiter.reset(`login:${email.toLowerCase()}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  // ... rest of config
};
```

#### Step 3: Apply to Registration

**File:** `/src/app/api/auth/register/route.ts`

```typescript
import { registerRateLimit, formatTimeRemaining } from '@/lib/rate-limit/memory';

export async function POST(request: Request) {
  try {
    // Get IP address
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // NEW: Rate limit check
    const rateLimit = await registerRateLimit(ip);

    if (!rateLimit.success) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetAt);
      return Response.json(
        {
          error: `Too many registration attempts. Please try again in ${timeRemaining}.`,
        },
        { status: 429 }
      );
    }

    const data = await request.json();
    const { email, password, name } = data;

    // ... rest of registration logic
  } catch (error) {
    // ... error handling
  }
}
```

#### Step 4: Utility to Get IP Address

**File:** `/src/lib/utils/ip.ts` (NEW)

```typescript
/**
 * Extract real IP address from request headers
 * Handles various proxy configurations
 */
export function getClientIp(request: Request): string {
  // Check common headers in order of reliability
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2, ...)
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback
  return 'unknown';
}
```

Update registration to use this utility:

```typescript
import { getClientIp } from '@/lib/utils/ip';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await registerRateLimit(ip);
  // ...
}
```

#### Testing Checklist

- [ ] 6th login attempt within 15 minutes is blocked
- [ ] 4th registration from same IP within 1 hour is blocked
- [ ] Rate limit resets after time window expires
- [ ] Successful login resets rate limit counter
- [ ] Error messages include time remaining
- [ ] Rate limits persist during server uptime
- [ ] Cleanup job removes expired entries

---

### 1.4 Apply Rate Limits to All Auth Endpoints (2h)

**Files to Update:**

1. **Password Reset Request** (will be created in Phase 3)
2. **Email Verification Resend** (will be created in Phase 2)

**Document for later:**

```typescript
// For password reset
import { resetPasswordRateLimit } from '@/lib/rate-limit/memory';
const rateLimit = await resetPasswordRateLimit(email);

// For email verification resend
import { verifyEmailRateLimit } from '@/lib/rate-limit/memory';
const rateLimit = await verifyEmailRateLimit(email);
```

---

### 1.5 CSRF Token Protection (3h)

**Strategy:** Use NextAuth's built-in CSRF protection and extend to custom endpoints.

#### Step 1: CSRF Utility

**File:** `/src/lib/auth/csrf.ts` (NEW)

```typescript
import { createHash, randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash CSRF token for storage in cookie
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Validate CSRF token from request
 * @param request - HTTP request with headers
 * @returns true if valid, false otherwise
 */
export function validateCSRF(request: Request): boolean {
  // Get token from header
  const csrfHeader = request.headers.get('x-csrf-token');

  // Get hashed token from cookie
  const cookies = request.headers.get('cookie');
  const csrfCookie = cookies?.match(/csrf-token=([^;]+)/)?.[1];

  if (!csrfHeader || !csrfCookie) {
    return false;
  }

  // Compare hashed values (constant-time comparison)
  return hashCSRFToken(csrfHeader) === csrfCookie;
}

/**
 * Set CSRF cookie in response
 */
export function setCSRFCookie(token: string): string {
  const hashedToken = hashCSRFToken(token);
  const maxAge = 60 * 60 * 24; // 24 hours

  return `csrf-token=${hashedToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
```

#### Step 2: Apply to Registration

**File:** `/src/app/api/auth/register/route.ts`

```typescript
import { validateCSRF } from '@/lib/auth/csrf';

export async function POST(request: Request) {
  // NEW: Validate CSRF token
  const isValidCSRF = validateCSRF(request);

  if (!isValidCSRF) {
    console.warn('[AUTH] Invalid CSRF token on registration attempt');
    return Response.json(
      { error: 'Invalid CSRF token. Please refresh the page and try again.' },
      { status: 403 }
    );
  }

  // ... rest of registration logic
}
```

#### Step 3: Frontend Integration

**File:** `/src/app/login/page.tsx`

```typescript
'use client';

import { getCsrfToken } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Get CSRF token from NextAuth
    getCsrfToken().then(token => {
      if (token) setCsrfToken(token);
    });
  }, []);

  const handleRegister = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken, // Include CSRF token
      },
      body: JSON.stringify({ email, password, name }),
    });

    // ... handle response
  };

  // ... rest of component
}
```

**Alternative:** Update AuthContext

**File:** `/src/contexts/AuthContext.tsx`

```typescript
import { getCsrfToken } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... existing code

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Get CSRF token
      const csrfToken = await getCsrfToken();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ email, password, name }),
      });

      // ... rest of signup logic
    } catch (error) {
      // ... error handling
    }
  };

  // ... rest of context
}
```

#### Testing Checklist

- [ ] Registration without CSRF token is rejected (403)
- [ ] Registration with valid CSRF token succeeds
- [ ] CSRF token is rotated on each request
- [ ] CSRF token expires after 24 hours

---

### 1.6 Protect Public API Routes (2h)

**Routes to protect:**

- `GET /api/tasks`
- `GET /api/task-attempts`

#### File: `/src/app/api/tasks/route.ts`

```typescript
import { getCurrentSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  // NEW: Require authentication
  const user = await getCurrentSessionUser();

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Parse filters
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  // Fetch tasks (accessible to all authenticated users)
  const tasks = await prisma.task.findMany({
    where: {
      category: category || undefined,
      difficulty: difficulty || undefined,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(tasks);
}

// POST /api/tasks already protected (admin only)
```

#### File: `/src/app/api/task-attempts/route.ts`

```typescript
import { getCurrentSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  // NEW: Require authentication
  const user = await getCurrentSessionUser();

  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const userId = searchParams.get('userId');

  // Security: Users can only view their own attempts
  // Admins can view all attempts
  const attempts = await prisma.taskAttempt.findMany({
    where: {
      taskId: taskId || undefined,
      // Non-admins can only see their own attempts
      userId: user.isAdmin ? userId || undefined : user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(attempts);
}

// POST /api/task-attempts already protected
```

#### Testing Checklist

- [ ] Unauthenticated GET /api/tasks returns 401
- [ ] Authenticated GET /api/tasks returns tasks
- [ ] Unauthenticated GET /api/task-attempts returns 401
- [ ] User can only see their own task attempts
- [ ] Admin can see all task attempts

---

### Phase 1 Completion Checklist

- [ ] Generic error messages implemented
- [ ] Password validation (8+ chars, complexity) implemented
- [ ] In-memory rate limiting implemented
- [ ] Rate limits applied to login, registration
- [ ] CSRF protection on registration
- [ ] Public API routes protected
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated

---

## Phase 2: Email System (SMTP2GO) (Week 1-2)

**Effort:** 14.5 hours
**Priority:** HIGH

### 2.1 Setup SMTP2GO Account (1h)

#### Steps

1. **Create Account**
   - Go to https://www.smtp2go.com/
   - Sign up for free account
   - Verify your email address

2. **Get SMTP Credentials**
   - Navigate to "Settings" → "Users"
   - Create new SMTP user
   - Save username and password
   - Note: SMTP server is `mail.smtp2go.com`, port `2525` or `587`

3. **Configure Sending Domain (Optional)**
   - Add your domain in "Settings" → "Sending Domains"
   - Add SPF and DKIM records to your DNS
   - Verify domain ownership
   - _Note: You can use smtp2go.com domain for testing_

4. **Update Environment Variables**

```env
# .env.local
EMAIL_SERVER_HOST=mail.smtp2go.com
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=<your-smtp2go-username>
EMAIL_SERVER_PASSWORD=<your-smtp2go-password>
EMAIL_FROM=noreply@yourdomain.com  # or noreply@smtp2go.com for testing
APP_NAME=GengoBot
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
```

---

### 2.2 Install Nodemailer (0.5h)

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

### 2.3 Create Email Service Utility (4h)

#### File: `/src/lib/email/transporter.ts` (NEW)

```typescript
import nodemailer from 'nodemailer';

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '2525'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Verify transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP server is ready to send emails');
    return true;
  } catch (error) {
    console.error('[EMAIL] SMTP server verification failed:', error);
    return false;
  }
}
```

#### File: `/src/lib/email/templates.ts` (NEW)

```typescript
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const APP_NAME = process.env.APP_NAME || 'GengoBot';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Email verification template
 */
export function getVerificationEmailTemplate(name: string, verificationUrl: string): EmailTemplate {
  return {
    subject: `Verify your ${APP_NAME} account`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to ${APP_NAME}!</h1>

            <p>Hi ${name || 'there'},</p>

            <p>Thanks for signing up! Please verify your email address to complete your registration and start learning Japanese.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours for security reasons.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to ${APP_NAME}!

Hi ${name || 'there'},

Thanks for signing up! Please verify your email address to complete your registration and start learning Japanese.

Verify your email by clicking this link:
${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
    `,
  };
}

/**
 * Password reset template
 */
export function getPasswordResetEmailTemplate(name: string, resetUrl: string): EmailTemplate {
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h1 style="color: #dc2626; margin-bottom: 20px;">Password Reset Request</h1>

            <p>Hi ${name || 'there'},</p>

            <p>We received a request to reset your password for your ${APP_NAME} account.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Password Reset Request

Hi ${name || 'there'},

We received a request to reset your password for your ${APP_NAME} account.

Reset your password by clicking this link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    `,
  };
}

/**
 * Account already exists notification
 */
export function getAccountExistsEmailTemplate(email: string): EmailTemplate {
  return {
    subject: `${APP_NAME} account registration attempt`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Registration Attempt</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h1 style="color: #f59e0b; margin-bottom: 20px;">Account Registration Attempt</h1>

            <p>Hello,</p>

            <p>Someone tried to create a new ${APP_NAME} account using this email address (${email}), but an account with this email already exists.</p>

            <p><strong>If this was you:</strong></p>
            <ul>
              <li>You can <a href="${APP_URL}/login" style="color: #2563eb;">sign in here</a></li>
              <li>If you forgot your password, you can <a href="${APP_URL}/forgot-password" style="color: #2563eb;">reset it here</a></li>
            </ul>

            <p><strong>If this wasn't you:</strong></p>
            <p>Your account is secure. No changes have been made. You can safely ignore this email.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              For security questions, please contact support.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Account Registration Attempt

Hello,

Someone tried to create a new ${APP_NAME} account using this email address (${email}), but an account with this email already exists.

If this was you:
- You can sign in here: ${APP_URL}/login
- If you forgot your password, you can reset it here: ${APP_URL}/forgot-password

If this wasn't you:
Your account is secure. No changes have been made. You can safely ignore this email.

For security questions, please contact support.
    `,
  };
}

/**
 * Welcome email after verification
 */
export function getWelcomeEmailTemplate(name: string): EmailTemplate {
  return {
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h1 style="color: #10b981; margin-bottom: 20px;">Welcome to ${APP_NAME}! 🎉</h1>

            <p>Hi ${name},</p>

            <p>Your email has been verified and your account is now active! You're all set to start your Japanese learning journey.</p>

            <h2 style="color: #2563eb; font-size: 18px; margin-top: 30px;">Getting Started:</h2>
            <ul>
              <li>Complete your first task to earn points</li>
              <li>Track your progress in your dashboard</li>
              <li>Build your study deck with flashcards</li>
              <li>Challenge yourself with different difficulty levels</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${APP_URL}/dashboard"
                 style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>

            <p>Happy learning! がんばって！ (Ganbatte!)</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              Need help? Visit our <a href="${APP_URL}/help" style="color: #2563eb;">help center</a> or contact support.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to ${APP_NAME}! 🎉

Hi ${name},

Your email has been verified and your account is now active! You're all set to start your Japanese learning journey.

Getting Started:
- Complete your first task to earn points
- Track your progress in your dashboard
- Build your study deck with flashcards
- Challenge yourself with different difficulty levels

Go to your dashboard: ${APP_URL}/dashboard

Happy learning! がんばって！ (Ganbatte!)

Need help? Visit our help center at ${APP_URL}/help or contact support.
    `,
  };
}
```

#### File: `/src/lib/email/send.ts` (NEW)

```typescript
import { transporter } from './transporter';
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getAccountExistsEmailTemplate,
  getWelcomeEmailTemplate,
} from './templates';

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@gengobot.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Base email sending function
 */
async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EMAIL] Sent "${subject}" to ${to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  const template = getVerificationEmailTemplate(name, verificationUrl);

  await sendEmail({
    to: email,
    ...template,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const template = getPasswordResetEmailTemplate(name, resetUrl);

  await sendEmail({
    to: email,
    ...template,
  });
}

/**
 * Send account exists notification
 */
export async function sendAccountExistsEmail(email: string): Promise<void> {
  const template = getAccountExistsEmailTemplate(email);

  await sendEmail({
    to: email,
    ...template,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const template = getWelcomeEmailTemplate(name);

  await sendEmail({
    to: email,
    ...template,
  });
}
```

#### Testing Checklist

- [ ] SMTP2GO account created and verified
- [ ] Environment variables configured
- [ ] Email transporter works (run verification)
- [ ] Can send test email
- [ ] Templates render correctly (HTML & text)

---

### 2.4 Email Verification Schema (1h)

#### Prisma Migration

**File:** `/prisma/schema.prisma`

```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String   // Not unique - allow multiple pending verifications
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([token])
  @@index([expires])
}
```

**Run migration:**

```bash
npx prisma migrate dev --name add_email_verification_token
npx prisma generate
```

---

### 2.5 Email Verification API (3h)

#### File: `/src/lib/auth/tokens.ts` (NEW)

```typescript
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Generate email verification token
 * @param email - User email
 * @returns Token string
 */
export async function generateVerificationToken(email: string): Promise<string> {
  // Generate secure random token
  const token = randomBytes(32).toString('hex');

  // Token expires in 24 hours
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  // Create new token
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify email with token
 * @param token - Verification token
 * @returns Email if valid, null otherwise
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null;
  }

  // Check if expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { token },
    });
    return null;
  }

  // Delete used token
  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return verificationToken.email;
}

/**
 * Clean up expired verification tokens (run periodically)
 */
export async function cleanupExpiredVerificationTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });

  return result.count;
}
```

#### File: `/src/app/api/auth/verify-email/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/tokens';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token and get email
    const email = await verifyEmailToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Update user's emailVerified field
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name || 'there');
    } catch (error) {
      console.error('[EMAIL] Failed to send welcome email:', error);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[AUTH] Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### File: `/src/app/api/auth/resend-verification/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email/send';
import { verifyEmailRateLimit, formatTimeRemaining } from '@/lib/rate-limit/memory';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Rate limit check
    const rateLimit = await verifyEmailRateLimit(email);

    if (!rateLimit.success) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetAt);
      return NextResponse.json(
        { error: `Too many verification emails sent. Please try again in ${timeRemaining}.` },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generic response (don't reveal if user exists)
      return NextResponse.json({
        message:
          'If an account with that email exists and is unverified, a verification email has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: 'This email is already verified.',
      });
    }

    // Generate new token
    const token = await generateVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(email, user.name || 'there', token);

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('[AUTH] Resend verification error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
```

---

### 2.6 Update Registration to Send Verification (2h)

**File:** `/src/app/api/auth/register/route.ts`

```typescript
import { generateVerificationToken } from '@/lib/auth/tokens';
import { sendVerificationEmail, sendAccountExistsEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    // ... existing validation and rate limiting code

    const data = await request.json();
    const { email, password, name } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.warn(`[AUTH] Registration attempt with existing email: ${email}`);

      // Send notification to existing user
      try {
        await sendAccountExistsEmail(email);
      } catch (error) {
        console.error('[EMAIL] Failed to send account exists email:', error);
      }

      // Return generic success message
      return Response.json(
        {
          message: 'Registration successful. Please check your email to verify your account.',
        },
        { status: 201 }
      );
    }

    // Create user (emailVerified is null by default)
    const user = await createUser({
      email,
      password,
      name,
    });

    // Generate verification token
    const token = await generateVerificationToken(email);

    // Send verification email
    try {
      await sendVerificationEmail(email, user.name || 'there', token);
    } catch (error) {
      console.error('[EMAIL] Failed to send verification email:', error);
      // Don't fail registration if email fails
      // User can request resend later
    }

    return Response.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

---

### 2.7 Email Verification UI (3h)

#### File: `/src/app/verify-email/page.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    // Verify email
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
              <p className="mt-2 text-gray-600">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{message}</p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Login
                </Link>
                <ResendVerificationButton />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResendVerificationButton() {
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
        setEmail('');
        setShowForm(false);
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
      >
        Resend Verification Email
      </button>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Verification Email'}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
```

---

### 2.8 Prevent Unverified Users from Logging In (Optional)

**File:** `/src/lib/auth/config.ts`

```typescript
// In CredentialsProvider authorize function:
async authorize(credentials) {
  // ... existing code

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  // NEW: Check email verification (optional - enforce or just warn)
  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
  }

  // ... rest of authorization
}
```

**Alternative (softer approach):** Allow login but show banner:

```typescript
// Don't block login, but include verification status in session
return {
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
  isAdmin: user.isAdmin,
  emailVerified: !!user.emailVerified, // Add to session
};
```

Then show banner in dashboard:

```typescript
// In dashboard layout
{!session.user.emailVerified && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <p className="text-yellow-700">
      Please verify your email. <button onClick={resendVerification}>Resend verification email</button>
    </p>
  </div>
)}
```

---

### Phase 2 Completion Checklist

- [ ] SMTP2GO account created and configured
- [ ] Nodemailer installed and configured
- [ ] Email templates created (verification, reset, welcome, etc.)
- [ ] Email verification schema migrated
- [ ] Verification token generation/validation implemented
- [ ] Verification API endpoints created
- [ ] Registration sends verification email
- [ ] Verification UI page created
- [ ] Resend verification functionality works
- [ ] All email templates tested
- [ ] Rate limiting on email resend works

---

## Phase 3: Password Reset (Week 2)

**Effort:** 14 hours
**Priority:** HIGH

### 3.1 Password Reset Token Schema (1h)

**File:** `/prisma/schema.prisma`

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([token])
  @@index([expires])
}
```

**Run migration:**

```bash
npx prisma migrate dev --name add_password_reset_token
npx prisma generate
```

---

### 3.2 Password Reset Token Functions (2h)

**File:** `/src/lib/auth/tokens.ts` (ADD to existing file)

```typescript
/**
 * Generate password reset token
 * @param email - User email
 * @returns Token string
 */
export async function generatePasswordResetToken(email: string): Promise<string> {
  // Generate secure random token
  const token = randomBytes(32).toString('hex');

  // Token expires in 1 hour (shorter than verification for security)
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  // Delete any existing reset tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify password reset token
 * @param token - Reset token
 * @returns Email if valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return null;
  }

  // Check if expired
  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    return null;
  }

  // Don't delete yet - will be deleted when password is actually reset
  return resetToken.email;
}

/**
 * Delete password reset token (after successful reset)
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.delete({
    where: { token },
  });
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });

  return result.count;
}
```

---

### 3.3 Forgot Password API (3h)

**File:** `/src/app/api/auth/forgot-password/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/email/send';
import { resetPasswordRateLimit, formatTimeRemaining } from '@/lib/rate-limit/memory';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Rate limit check
    const rateLimit = await resetPasswordRateLimit(email);

    if (!rateLimit.success) {
      // Return generic message even when rate limited (prevent enumeration)
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return same message (prevent email enumeration)
    const genericResponse = NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    if (!user) {
      // User doesn't exist, but return success message
      return genericResponse;
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.password) {
      // User exists but uses OAuth, still return success message
      console.warn(`[AUTH] Password reset requested for OAuth-only user: ${email}`);
      return genericResponse;
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email);

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name || 'there', token);
      console.log(`[AUTH] Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('[EMAIL] Failed to send password reset email:', error);
      // Don't reveal email sending failure
    }

    return genericResponse;
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    // Return generic message even on error
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }
}
```

---

### 3.4 Reset Password API (3h)

**File:** `/src/app/api/auth/reset-password/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/auth/tokens';
import { validatePassword } from '@/lib/auth/password-validator';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Validate password strength
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify reset token
    const email = await verifyPasswordResetToken(token);

    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        // Optional: Mark email as verified if not already
        emailVerified: { set: new Date() },
      },
    });

    // Delete used reset token
    await deletePasswordResetToken(token);

    // Optional: Invalidate all existing sessions
    // (Force user to login with new password)
    // await prisma.session.deleteMany({
    //   where: { userId: user.id },
    // });

    console.log(`[AUTH] Password reset successful for: ${email}`);

    return NextResponse.json({
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
```

---

### 3.5 Forgot Password Page (2h)

**File:** `/src/app/forgot-password/page.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 3.6 Reset Password Page (3h)

**File:** `/src/app/reset-password/page.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePassword } from '@/lib/auth/password-validator';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors([]);

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength && !passwordStrength.isValid) {
      setErrors(passwordStrength.errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 2000);
      } else {
        setErrors([data.error || 'Failed to reset password']);
        if (data.details) {
          setErrors((prev) => [...prev, ...data.details]);
        }
      }
    } catch (err) {
      setErrors(['An error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-500"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="New password"
              />

              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.strength === 'weak' ? 'w-1/4 bg-red-500' :
                          passwordStrength.strength === 'medium' ? 'w-1/2 bg-yellow-500' :
                          passwordStrength.strength === 'strong' ? 'w-3/4 bg-green-500' :
                          'w-full bg-blue-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium capitalize">
                      {passwordStrength.strength}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {/* Password requirements */}
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Password must contain:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 8 characters</li>
              <li>• At least 1 uppercase letter</li>
              <li>• At least 1 lowercase letter</li>
              <li>• At least 1 number</li>
            </ul>
          </div>

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### 3.7 Add Forgot Password Link to Login Page (1h)

**File:** `/src/app/login/page.tsx`

```typescript
// Add this link below the login form
<div className="text-center mt-4">
  <Link
    href="/forgot-password"
    className="text-sm text-blue-600 hover:text-blue-500"
  >
    Forgot your password?
  </Link>
</div>
```

---

### Phase 3 Completion Checklist

- [ ] Password reset token schema migrated
- [ ] Token generation/validation functions created
- [ ] Forgot password API endpoint created
- [ ] Reset password API endpoint created
- [ ] Password reset email template works
- [ ] Forgot password page created
- [ ] Reset password page created
- [ ] Forgot password link added to login
- [ ] Rate limiting on reset requests works
- [ ] Generic error messages prevent enumeration
- [ ] Password validation works on reset
- [ ] Expired tokens are rejected
- [ ] Used tokens are deleted

---

## Phase 4: Google OAuth (Week 3)

**Effort:** 10 hours
**Priority:** MEDIUM

### 4.1 Setup Google Cloud Console (1h)

#### Steps

1. **Create Project**
   - Go to https://console.cloud.google.com/
   - Create new project: "GengoBot" (or use existing)
   - Enable project

2. **Configure OAuth Consent Screen**
   - Navigate to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - Fill in required fields:
     - App name: GengoBot
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

3. **Create OAuth 2.0 Credentials**
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "GengoBot Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Click "Create"
   - **Save Client ID and Client Secret**

4. **Update Environment Variables**

```env
# .env.local
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

---

### 4.2 Add Google Provider to NextAuth Config (2h)

**File:** `/src/lib/auth/config.ts`

```typescript
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // Existing Credentials Provider
    CredentialsProvider({
      // ... existing credentials config
    }),

    // NEW: Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Add user ID and admin status to token
      if (user) {
        token.id = user.id;

        // For Google OAuth, check if user exists in database
        if (account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          token.isAdmin = dbUser?.isAdmin || false;
        } else {
          // For credentials login
          token.isAdmin = (user as any).isAdmin || false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },

    // NEW: Handle account linking
    async signIn({ user, account, profile, email, credentials }) {
      // For Google OAuth
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          // Check if this Google account is already linked
          const linkedAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: 'google',
            },
          });

          if (!linkedAccount) {
            // Link Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });

            console.log(`[AUTH] Linked Google account to existing user: ${user.email}`);
          }

          // Mark email as verified (Google verified it)
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
        } else {
          // New Google user - email will be automatically verified
          console.log(`[AUTH] New user via Google OAuth: ${user.email}`);
        }
      }

      return true; // Allow sign in
    },
  },

  // ... rest of config
};
```

---

### 4.3 Handle OAuth Account Linking (3h)

The account linking logic is already handled in the `signIn` callback above. This section documents edge cases and testing.

#### Edge Cases to Handle

1. **User exists with password, wants to add Google**
   - ✅ Link Google account to existing user
   - ✅ Automatically verify email

2. **User exists with Google, tries to register with password**
   - ✅ Show "Email already exists" message
   - ✅ Suggest signing in with Google

3. **User has both password and Google**
   - ✅ Can sign in with either method
   - ✅ Both use same user account

4. **User tries to link multiple Google accounts**
   - ✅ Only one Google account per user email
   - ⚠️ Consider allowing multiple OAuth providers (Google, GitHub, etc.)

---

### 4.4 Update Login UI with Google Button (2h)

**File:** `/src/app/login/page.tsx`

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const verified = searchParams.get('verified');
  const reset = searchParams.get('reset');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to GengoBot
          </h2>
        </div>

        {verified && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">
              ✓ Email verified! You can now sign in.
            </p>
          </div>
        )}

        {reset && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">
              ✓ Password reset successful! Sign in with your new password.
            </p>
          </div>
        )}

        {/* Google Sign In Button */}
        <div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 4.5 Testing OAuth Flow (2h)

#### Test Cases

1. **New user signs up with Google**
   - [ ] User is created in database
   - [ ] Email is automatically verified
   - [ ] User redirected to dashboard
   - [ ] Can access protected routes

2. **Existing user (password) signs in with Google**
   - [ ] Google account is linked to existing user
   - [ ] Email is verified
   - [ ] User sees same data (same account)
   - [ ] Can sign in with either method afterward

3. **User with Google tries to register with password**
   - [ ] Registration shows generic message
   - [ ] Account exists email sent
   - [ ] No duplicate account created

4. **Error handling**
   - [ ] OAuth cancellation redirects to login with error
   - [ ] Invalid OAuth state shows error
   - [ ] Network errors handled gracefully

5. **Account switching**
   - [ ] Can sign out and sign in with different account
   - [ ] Multiple Google accounts work correctly

---

### Phase 4 Completion Checklist

- [ ] Google Cloud Console project created
- [ ] OAuth credentials configured
- [ ] Environment variables set
- [ ] Google provider added to NextAuth
- [ ] Account linking logic implemented
- [ ] Login UI updated with Google button
- [ ] OAuth flow tested (new user)
- [ ] OAuth flow tested (existing user)
- [ ] Email verification automatic with Google
- [ ] Error handling tested
- [ ] Can sign in with both methods

---

## Testing Strategy

### Unit Tests

**Test Files to Create:**

1. **Password Validation** (`/src/lib/auth/__tests__/password-validator.test.ts`)

   ```typescript
   describe('validatePassword', () => {
     test('rejects password < 8 chars', () => {});
     test('rejects password without uppercase', () => {});
     test('rejects password without lowercase', () => {});
     test('rejects password without number', () => {});
     test('rejects common passwords', () => {});
     test('accepts valid password', () => {});
   });
   ```

2. **Rate Limiting** (`/src/lib/rate-limit/__tests__/memory.test.ts`)

   ```typescript
   describe('MemoryRateLimiter', () => {
     test('allows first request', () => {});
     test('blocks after limit exceeded', () => {});
     test('resets after time window', () => {});
     test('tracks different keys separately', () => {});
   });
   ```

3. **Token Generation** (`/src/lib/auth/__tests__/tokens.test.ts`)
   ```typescript
   describe('Email verification tokens', () => {
     test('generates unique tokens', () => {});
     test('expires after 24 hours', () => {});
     test('verifies valid token', () => {});
     test('rejects expired token', () => {});
   });
   ```

---

### Integration Tests

1. **Registration Flow**
   - POST /api/auth/register with valid data
   - Verify user created in database
   - Verify verification email sent
   - POST /api/auth/verify-email with token
   - Verify user email verified

2. **Login Flow**
   - POST /api/auth/signin with credentials
   - Verify JWT token received
   - Verify protected routes accessible
   - Rate limit: 6th attempt blocked

3. **Password Reset Flow**
   - POST /api/auth/forgot-password
   - Verify reset email sent
   - POST /api/auth/reset-password with token
   - Verify password changed
   - Login with new password

4. **OAuth Flow**
   - Sign in with Google (mock)
   - Verify account created/linked
   - Verify email verified
   - Access protected routes

---

### Manual Testing Checklist

#### Phase 1: Security

- [ ] Login fails after 5 attempts
- [ ] Registration fails after 3 attempts from same IP
- [ ] Registration rejects weak password
- [ ] Registration requires CSRF token
- [ ] Error messages are generic (no enumeration)
- [ ] Public API routes require authentication

#### Phase 2: Email

- [ ] Registration sends verification email
- [ ] Verification link works
- [ ] Expired verification link rejected
- [ ] Resend verification works
- [ ] Welcome email sent after verification

#### Phase 3: Password Reset

- [ ] Forgot password sends email
- [ ] Reset link works
- [ ] Expired reset link rejected
- [ ] Password reset requires strong password
- [ ] Can login with new password

#### Phase 4: OAuth

- [ ] Google login creates account
- [ ] Google login links to existing account
- [ ] Can switch between password and Google
- [ ] Email automatically verified with Google

---

## Deployment Checklist

### Environment Variables

```bash
# Production .env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://yourdomain.com

# Email
EMAIL_SERVER_HOST=mail.smtp2go.com
EMAIL_SERVER_PORT=2525
EMAIL_SERVER_USER=<smtp-user>
EMAIL_SERVER_PASSWORD=<smtp-password>
EMAIL_FROM=noreply@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_NAME=GengoBot
NODE_ENV=production
```

### Database Migrations

```bash
# Run all migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Security Checklist

- [ ] NEXTAUTH_SECRET is strong random value (32+ chars)
- [ ] All sensitive env vars are set
- [ ] Database uses SSL connection
- [ ] SMTP credentials are secure
- [ ] Google OAuth redirect URLs are whitelisted
- [ ] CORS configured for production domain
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] Security headers configured

### DNS & Email Configuration

- [ ] SPF record added: `v=spf1 include:smtp2go.com ~all`
- [ ] DKIM record added (provided by SMTP2GO)
- [ ] DMARC record added (optional)
- [ ] Test email deliverability

### Monitoring

- [ ] Setup error tracking (Sentry, etc.)
- [ ] Monitor email sending (SMTP2GO dashboard)
- [ ] Monitor rate limit hits
- [ ] Setup alerts for failed logins
- [ ] Track verification/reset email success rates

---

## Rollback Plan

### If Issues Arise

1. **Critical auth bug discovered**

   ```bash
   git revert <commit-hash>
   git push origin main
   vercel --prod  # or your deployment command
   ```

2. **Database migration issue**

   ```bash
   # Rollback last migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Email service down**
   - Temporarily disable email verification requirement
   - Update registration to not send emails
   - Deploy hotfix
   - Fix email service
   - Re-enable email verification

4. **Rate limiting too aggressive**
   - Adjust limits in `/src/lib/rate-limit/memory.ts`
   - Deploy update
   - Monitor login success rates

---

## Maintenance Tasks

### Periodic Cleanup

**Cron Job:** Run daily at 2 AM

```typescript
// /src/lib/cron/cleanup-tokens.ts
import {
  cleanupExpiredVerificationTokens,
  cleanupExpiredPasswordResetTokens,
} from '@/lib/auth/tokens';

export async function dailyCleanup() {
  console.log('[CLEANUP] Starting daily token cleanup...');

  const verificationCleaned = await cleanupExpiredVerificationTokens();
  const resetCleaned = await cleanupExpiredPasswordResetTokens();

  console.log(`[CLEANUP] Removed ${verificationCleaned} verification tokens`);
  console.log(`[CLEANUP] Removed ${resetCleaned} reset tokens`);
}
```

**Setup:** Use Vercel Cron Jobs or system cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Support & Documentation

### User Guides

- [ ] How to reset password
- [ ] How to verify email
- [ ] How to link Google account
- [ ] Troubleshooting auth issues

### Admin Documentation

- [ ] How to manage user verification
- [ ] How to reset user passwords manually
- [ ] How to handle email delivery issues
- [ ] How to monitor rate limiting

---

## Success Metrics

Track these metrics post-deployment:

- **Security:**
  - Rate limit hit rate (should be < 1% of logins)
  - Failed login attempts
  - Password reset requests

- **Email:**
  - Email delivery rate (should be > 98%)
  - Email verification completion rate
  - Email open rates

- **OAuth:**
  - Google login usage (% of total logins)
  - Account linking success rate

- **User Experience:**
  - Time to first verification
  - Password reset completion rate
  - Support tickets related to auth

---

## Troubleshooting Guide

### Common Issues

**Issue: Verification emails not received**

- Check SMTP2GO dashboard for send logs
- Check spam folder
- Verify SPF/DKIM records
- Test with different email provider

**Issue: Rate limiting too strict**

- Check rate limit configuration
- Review IP extraction logic
- Consider whitelisting known IPs
- Adjust limits based on traffic

**Issue: Google OAuth not working**

- Verify redirect URIs in Google Console
- Check environment variables
- Ensure consent screen is configured
- Review NextAuth logs

**Issue: Password reset links expire too quickly**

- Default is 1 hour (security best practice)
- Consider extending to 2-4 hours if needed
- Add "resend reset link" functionality

---

## Next Steps After Implementation

1. **User Migration (if existing users)**
   - Send password reset emails to all users
   - Require email verification on next login
   - Provide grace period before enforcing

2. **Feature Enhancements**
   - Add 2FA/MFA (Phase 5, optional)
   - Add more OAuth providers (GitHub, Discord)
   - Implement "Remember me" functionality
   - Add login history/activity log

3. **Security Audits**
   - Run penetration tests
   - Review security best practices
   - Monitor for vulnerabilities
   - Keep dependencies updated

---

**End of Implementation Guide**

Last Updated: 2025-01-16
Branch: feature/auth-overhaul
Status: Ready for Development

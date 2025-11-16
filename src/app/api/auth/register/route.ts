import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/helpers';
import { prisma } from '@/lib/prisma';
import { validatePassword } from '@/lib/auth/password-validator';
import { registerRateLimit, formatTimeRemaining } from '@/lib/rate-limit/memory';
import { getClientIp } from '@/lib/utils/ip';
import { validateCSRF } from '@/lib/auth/csrf';

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token (prevent CSRF attacks)
    const isValidCSRF = validateCSRF(request);

    if (!isValidCSRF) {
      console.warn('[AUTH] Invalid CSRF token on registration attempt');
      return NextResponse.json(
        { message: 'Invalid CSRF token. Please refresh the page and try again.' },
        { status: 403 }
      );
    }

    // Get IP address for rate limiting
    const ip = getClientIp(request);

    // Rate limit check (prevent spam registrations)
    const rateLimit = await registerRateLimit(ip);

    if (!rateLimit.success) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetAt);
      return NextResponse.json(
        {
          message: `Too many registration attempts. Please try again in ${timeRemaining}.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Validate password strength
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          message: 'Password does not meet security requirements',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Log internally for monitoring (don't reveal to user)
      console.warn(`[AUTH] Registration attempt with existing email: ${email}`);

      // Return generic success message (prevent email enumeration)
      return NextResponse.json(
        {
          message: 'Registration successful. Please check your email to verify your account.',
        },
        { status: 201 }
      );
    }

    // Create new user
    const user = await createUser({
      email,
      password,
      name,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

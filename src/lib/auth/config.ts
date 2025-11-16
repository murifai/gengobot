import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginRateLimit, formatTimeRemaining, rateLimiter } from '@/lib/rate-limit/memory';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    Credentials({
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

        // Rate limit check BEFORE database query (prevent brute force)
        const rateLimit = await loginRateLimit(email);

        if (!rateLimit.success) {
          const timeRemaining = formatTimeRemaining(rateLimit.resetAt);
          throw new Error(`Too many login attempts. Please try again in ${timeRemaining}.`);
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          // Log internally with different codes for monitoring
          console.warn(
            `[AUTH] Failed login attempt: ${user ? 'invalid_password' : 'user_not_found'}`,
            {
              email,
            }
          );

          // Same error for both cases (prevent email enumeration)
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.warn(`[AUTH] Failed login attempt: invalid_password`, { email });
          throw new Error('Invalid email or password');
        }

        // Reset rate limit on successful login
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.isAdmin = (user as { id: string; isAdmin?: boolean }).isAdmin ?? false;
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
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

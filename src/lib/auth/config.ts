import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  basePath: '/api/auth',

  // Cookie configuration for production (Cloudflare + Nginx proxy)
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: 'authjs.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
    callbackUrl: {
      name: 'authjs.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },

  providers: [
    Google({
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
  callbacks: {
    async signIn({ account, profile }) {
      // Only allow Google OAuth
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Get image from Google profile (can be 'picture' or 'image')
          const profileImage =
            (profile as { picture?: string }).picture ||
            (profile as { image?: string }).image ||
            null;

          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!existingUser) {
            // Create new user with onboardingCompleted = false
            await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || null,
                fullName: profile.name || null, // Also store in fullName for profile display
                image: profileImage,
                emailVerified: new Date(),
                isAdmin: false,
                onboardingCompleted: false,
              },
            });
          } else {
            // Update existing user info
            await prisma.user.update({
              where: { email: profile.email },
              data: {
                name: profile.name || existingUser.name,
                // Only update fullName if it's not set yet (user may have customized it)
                fullName: existingUser.fullName || profile.name || existingUser.name,
                image: profileImage || existingUser.image,
                emailVerified: new Date(),
              },
            });
          }

          return true;
        } catch (error) {
          console.error('[AUTH] Error in Google signIn callback:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            email: profile.email,
          });
          return false;
        }
      }

      return false;
    },
    async jwt({ token, account, profile }) {
      // On first sign in (account exists), fetch user data from database
      if (account && profile?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
            select: {
              id: true,
              isAdmin: true,
              email: true,
              name: true,
              image: true,
              onboardingCompleted: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.isAdmin = dbUser.isAdmin;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.onboardingCompleted = dbUser.onboardingCompleted;
          }
        } catch (error) {
          console.error('[AUTH] Error in JWT callback:', error);
        }
      }

      // Token already has all data for subsequent requests
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        (session.user as { onboardingCompleted?: boolean }).onboardingCompleted =
          token.onboardingCompleted as boolean;
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
  secret: process.env.AUTH_SECRET,
};

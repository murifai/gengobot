import { prisma } from '@/lib/prisma';
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Sync Supabase user to Prisma database
 * Creates or updates the user record
 */
export async function syncUser(supabaseUser: SupabaseUser) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { authId: supabaseUser.id },
    });

    if (existingUser) {
      // Update existing user
      return await prisma.user.update({
        where: { authId: supabaseUser.id },
        data: {
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        },
      });
    }

    // Create new user
    return await prisma.user.create({
      data: {
        authId: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        isAdmin: false, // Default to non-admin
        proficiency: 'N5', // Default JLPT level
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}

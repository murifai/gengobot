import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth/admin-auth';

export async function POST() {
  try {
    await destroyAdminSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

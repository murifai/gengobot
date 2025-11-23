import { NextResponse } from 'next/server';
import { generateResetToken, getAdminByEmail } from '@/lib/auth/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate reset token
    const token = await generateResetToken(email);

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (token) {
      const admin = await getAdminByEmail(email);

      // TODO: Send email with reset link
      // For development, log the token
      console.log(`Password reset token for ${email}: ${token}`);
      console.log(
        `Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/admin/auth/reset-password?token=${token}`
      );

      // In production, send email
      // await sendPasswordResetEmail(admin.email, admin.name, token);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

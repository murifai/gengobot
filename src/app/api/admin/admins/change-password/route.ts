import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import bcrypt from 'bcryptjs';

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Konfirmasi password tidak cocok' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password baru minimal 8 karakter' }, { status: 400 });
    }

    // Get admin with password
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { password: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.admin.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

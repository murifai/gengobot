import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { hasPermission } from '@/lib/auth/admin-rbac';

// GET - Fetch single admin
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'admins.view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update admin
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'admins.edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, role, isActive } = body;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    // Prevent self-deactivation
    if (id === session.id && isActive === false) {
      return NextResponse.json({ error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 });
    }

    // Prevent changing own role
    if (id === session.id && role && role !== session.role) {
      return NextResponse.json({ error: 'Tidak bisa mengubah role sendiri' }, { status: 400 });
    }

    // Validate role
    if (role && !['SUPER_ADMIN', 'ADMIN', 'VIEWER'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    // Update admin
    const admin = await prisma.admin.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'admins.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === session.id) {
      return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

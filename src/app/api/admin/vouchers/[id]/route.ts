import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { voucherAdminService } from '@/lib/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/vouchers/[id]
 * Get a single voucher with stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const voucher = await voucherAdminService.getVoucher(id);

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    const stats = await voucherAdminService.getVoucherStats(id);

    return NextResponse.json({ voucher, stats });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    return NextResponse.json({ error: 'Failed to fetch voucher' }, { status: 500 });
  }
}

/**
 * PUT/PATCH /api/admin/vouchers/[id]
 * Update a voucher
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Convert date strings to Date objects
    const updateData = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const voucher = await voucherAdminService.updateVoucher(id, updateData);

    return NextResponse.json({ voucher });
  } catch (error) {
    console.error('Error updating voucher:', error);
    const message = error instanceof Error ? error.message : 'Failed to update voucher';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// PATCH is an alias for PUT
export const PATCH = PUT;

/**
 * DELETE /api/admin/vouchers/[id]
 * Delete a voucher
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await voucherAdminService.deleteVoucher(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete voucher';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

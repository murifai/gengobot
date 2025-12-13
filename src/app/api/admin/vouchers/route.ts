import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { voucherAdminService } from '@/lib/admin';
import { VoucherType } from '@prisma/client';

/**
 * GET /api/admin/vouchers
 * Get all vouchers with stats and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role by looking up in Admin table
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') as VoucherType | undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam ? isActiveParam === 'true' : undefined;

    const result = await voucherAdminService.getAllVouchersWithStats({
      page,
      limit,
      search,
      type,
      isActive,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 });
  }
}

/**
 * POST /api/admin/vouchers
 * Create a new voucher
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role by looking up in Admin table
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Convert date strings to Date objects
    const voucherData = {
      ...body,
      createdBy: session.user.id,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    };

    const voucher = await voucherAdminService.createVoucher(voucherData);

    return NextResponse.json({ voucher });
  } catch (error) {
    console.error('Error creating voucher:', error);
    const message = error instanceof Error ? error.message : 'Failed to create voucher';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

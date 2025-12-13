import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { hasPermission } from '@/lib/auth/admin-rbac';
import { voucherAdminService } from '@/lib/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/vouchers/[id]/toggle
 * Toggle voucher active status
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'vouchers.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const voucher = await voucherAdminService.toggleActive(id, isActive);

    return NextResponse.json({ voucher });
  } catch (error) {
    console.error('Error toggling voucher:', error);
    return NextResponse.json({ error: 'Failed to toggle voucher' }, { status: 500 });
  }
}

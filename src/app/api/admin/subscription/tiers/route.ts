import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { hasPermission } from '@/lib/auth/admin-rbac';

// GET - Fetch all subscription tier configurations
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'subscription.view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tiers = await prisma.subscriptionTierConfig.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update subscription tier configurations
export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'subscription.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { tiers } = body;

    if (!Array.isArray(tiers)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Update each tier
    const updatedTiers = await Promise.all(
      tiers.map(
        async (tier: {
          name: string;
          priceMonthly: number;
          credits: number;
          features: string[];
          isActive: boolean;
          discount3Months?: number;
          discount6Months?: number;
          discount12Months?: number;
        }) => {
          // Validate tier name
          if (!['FREE', 'BASIC', 'PRO'].includes(tier.name)) {
            throw new Error(`Invalid tier name: ${tier.name}`);
          }

          // Validate prices
          if (tier.priceMonthly < 0) {
            throw new Error('Harga bulanan tidak boleh negatif');
          }

          // Validate credits
          if (tier.credits < 0) {
            throw new Error('Kredit tidak boleh negatif');
          }

          // Validate discounts (0-100)
          const discounts = [
            { name: '3 bulan', value: tier.discount3Months },
            { name: '6 bulan', value: tier.discount6Months },
            { name: '12 bulan', value: tier.discount12Months },
          ];

          for (const discount of discounts) {
            if (discount.value !== undefined && (discount.value < 0 || discount.value > 100)) {
              throw new Error(`Diskon ${discount.name} harus antara 0-100%`);
            }
          }

          return prisma.subscriptionTierConfig.upsert({
            where: { name: tier.name as 'FREE' | 'BASIC' | 'PRO' },
            update: {
              priceMonthly: tier.priceMonthly,
              credits: tier.credits,
              features: tier.features,
              isActive: tier.isActive,
              discount3Months: tier.discount3Months ?? 10,
              discount6Months: tier.discount6Months ?? 20,
              discount12Months: tier.discount12Months ?? 30,
            },
            create: {
              name: tier.name as 'FREE' | 'BASIC' | 'PRO',
              priceMonthly: tier.priceMonthly,
              credits: tier.credits,
              features: tier.features,
              isActive: tier.isActive,
              discount3Months: tier.discount3Months ?? 10,
              discount6Months: tier.discount6Months ?? 20,
              discount12Months: tier.discount12Months ?? 30,
            },
          });
        }
      )
    );

    return NextResponse.json({ tiers: updatedTiers });
  } catch (error) {
    console.error('Error updating subscription tiers:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
          priceAnnual: number;
          credits: number;
          features: string[];
          isActive: boolean;
        }) => {
          // Validate tier name
          if (!['FREE', 'BASIC', 'PRO'].includes(tier.name)) {
            throw new Error(`Invalid tier name: ${tier.name}`);
          }

          // Validate prices
          if (tier.priceMonthly < 0 || tier.priceAnnual < 0) {
            throw new Error('Prices cannot be negative');
          }

          // Validate credits
          if (tier.credits < 0) {
            throw new Error('Credits cannot be negative');
          }

          return prisma.subscriptionTierConfig.upsert({
            where: { name: tier.name as 'FREE' | 'BASIC' | 'PRO' },
            update: {
              priceMonthly: tier.priceMonthly,
              priceAnnual: tier.priceAnnual,
              credits: tier.credits,
              features: tier.features,
              isActive: tier.isActive,
            },
            create: {
              name: tier.name as 'FREE' | 'BASIC' | 'PRO',
              priceMonthly: tier.priceMonthly,
              priceAnnual: tier.priceAnnual,
              credits: tier.credits,
              features: tier.features,
              isActive: tier.isActive,
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

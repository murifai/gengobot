// Auto-generated from database export
// Generated at: 2025-12-09T14:24:53.444Z

import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

export const tiersData: Array<{
  name: SubscriptionTier;
  priceMonthly: number;
  credits: number;
  discount3Months: number;
  discount6Months: number;
  discount12Months: number;
  features: string[];
  isActive: boolean;
}> = [
  {
    name: 'FREE',
    priceMonthly: 0,
    credits: 5000,
    discount3Months: 0,
    discount6Months: 0,
    discount12Months: 0,
    features: [
      '14 hari trial',
      '5.000 kredit trial',
      'Akses ke semua task roleplay',
      'Kaiwa bebas (limit harian)',
      '1 karakter kustom',
      '5 chatroom',
    ],
    isActive: true,
  },
  {
    name: 'BASIC',
    priceMonthly: 39000,
    credits: 6000,
    discount3Months: 5,
    discount6Months: 15,
    discount12Months: 25,
    features: [
      'Akses ke semua task roleplay',
      '6.000 kredit per bulan',
      'Kaiwa bebas tanpa batas',
      'Voice chat standar',
      '5 karakter kustom',
      '5 chatroom',
      'Riwayat percakapan',
    ],
    isActive: true,
  },
  {
    name: 'PRO',
    priceMonthly: 59000,
    credits: 16500,
    discount3Months: 5,
    discount6Months: 15,
    discount12Months: 25,
    features: [
      'Semua fitur Basic',
      '16.500 kredit per bulan',
      'Realtime voice chat',
      'Analisis percakapan detail',
      'Karakter kustom tanpa batas',
      'Chatroom tanpa batas',
      'Prioritas support',
      'Early access fitur baru',
    ],
    isActive: true,
  },
];

export async function seedSubscriptionTiers() {
  console.log('Seeding subscription tiers...');

  for (const tier of tiersData) {
    await prisma.subscriptionTierConfig.upsert({
      where: { name: tier.name },
      update: {
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
        isActive: tier.isActive,
      },
      create: {
        name: tier.name,
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
        isActive: tier.isActive,
      },
    });
    console.log(`✓ Tier: ${tier.name}`);
  }

  console.log('✅ Subscription tiers seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  seedSubscriptionTiers()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

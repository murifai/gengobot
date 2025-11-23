import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding subscription tiers...');

  // Default tier configurations
  const tiers = [
    {
      name: 'FREE' as const,
      priceMonthly: 0,
      priceAnnual: 0,
      credits: 100,
      features: [
        'Akses ke 5 task roleplay',
        '100 kredit per bulan',
        'Kaiwa bebas terbatas',
        'Dek studi terbatas',
      ],
    },
    {
      name: 'BASIC' as const,
      priceMonthly: 49000,
      priceAnnual: 490000,
      credits: 1000,
      features: [
        'Akses ke semua task roleplay',
        '1.000 kredit per bulan',
        'Kaiwa bebas tanpa batas',
        'Dek studi tanpa batas',
        'Voice chat standar',
        'Riwayat percakapan',
      ],
    },
    {
      name: 'PRO' as const,
      priceMonthly: 99000,
      priceAnnual: 990000,
      credits: 5000,
      features: [
        'Semua fitur Basic',
        '5.000 kredit per bulan',
        'Realtime voice chat',
        'Analisis percakapan detail',
        'Prioritas support',
        'Early access fitur baru',
      ],
    },
  ];

  for (const tier of tiers) {
    await prisma.subscriptionTierConfig.upsert({
      where: { name: tier.name },
      update: {
        priceMonthly: tier.priceMonthly,
        priceAnnual: tier.priceAnnual,
        credits: tier.credits,
        features: tier.features,
      },
      create: {
        name: tier.name,
        priceMonthly: tier.priceMonthly,
        priceAnnual: tier.priceAnnual,
        credits: tier.credits,
        features: tier.features,
        isActive: true,
      },
    });

    console.log(`✅ Seeded tier: ${tier.name}`);
  }

  console.log('\nSubscription tiers seeded successfully!');
}

main()
  .catch(e => {
    console.error('Error seeding tiers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

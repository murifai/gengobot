import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding subscription tiers...');

  // Default tier configurations
  // priceMonthly = harga dasar bulanan
  // discount3Months, discount6Months, discount12Months = persentase diskon (0-100)
  const tiers = [
    {
      name: 'FREE' as const,
      priceMonthly: 0, // Gratis
      credits: 5000, // Trial credits
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
    },
    {
      name: 'BASIC' as const,
      priceMonthly: 29000, // Rp 29.000/bulan (harga dasar)
      credits: 6000, // Monthly credits
      discount3Months: 10, // 10% off untuk 3 bulan
      discount6Months: 20, // 20% off untuk 6 bulan
      discount12Months: 30, // 30% off untuk 12 bulan
      features: [
        'Akses ke semua task roleplay',
        '6.000 kredit per bulan',
        'Kaiwa bebas tanpa batas',
        'Voice chat standar',
        '5 karakter kustom',
        '5 chatroom',
        'Riwayat percakapan',
      ],
    },
    {
      name: 'PRO' as const,
      priceMonthly: 49000, // Rp 49.000/bulan (harga dasar)
      credits: 16500, // Monthly credits
      discount3Months: 10, // 10% off untuk 3 bulan
      discount6Months: 20, // 20% off untuk 6 bulan
      discount12Months: 30, // 30% off untuk 12 bulan
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
    },
  ];

  for (const tier of tiers) {
    await prisma.subscriptionTierConfig.upsert({
      where: { name: tier.name },
      update: {
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
      },
      create: {
        name: tier.name,
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
        isActive: true,
      },
    });

    // Log pricing info
    if (tier.priceMonthly > 0) {
      const price3m = Math.round(tier.priceMonthly * 3 * (1 - tier.discount3Months / 100));
      const price6m = Math.round(tier.priceMonthly * 6 * (1 - tier.discount6Months / 100));
      const price12m = Math.round(tier.priceMonthly * 12 * (1 - tier.discount12Months / 100));
      console.log(`✅ Seeded tier: ${tier.name}`);
      console.log(`   Harga: Rp ${tier.priceMonthly.toLocaleString('id-ID')}/bulan`);
      console.log(
        `   3 bulan: Rp ${price3m.toLocaleString('id-ID')} (diskon ${tier.discount3Months}%)`
      );
      console.log(
        `   6 bulan: Rp ${price6m.toLocaleString('id-ID')} (diskon ${tier.discount6Months}%)`
      );
      console.log(
        `   12 bulan: Rp ${price12m.toLocaleString('id-ID')} (diskon ${tier.discount12Months}%)`
      );
    } else {
      console.log(`✅ Seeded tier: ${tier.name} (gratis)`);
    }
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

// Auto-generated from database export
// Generated at: 2025-12-09T14:24:53.437Z

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoriesData = [
  {
    id: 'cmipplg920000dkuls66lv2fw',
    name: 'Jalan-jalan',
    subcategories: [
      {
        id: 'cmipplg970002dkul86qgo32g',
        name: 'Belanja',
      },
      {
        id: 'cmipplg9i0004dkulgcdie73f',
        name: 'Di Bandara',
      },
      {
        id: 'cmipplg9j0006dkulhu3uepqu',
        name: 'Di Hotel',
      },
      {
        id: 'cmipplg9k0008dkulw3i0gvnt',
        name: 'Di Stasiun',
      },
      {
        id: 'cmipplg9l000adkul3ozl2qgm',
        name: 'Jalan-jalan',
      },
      {
        id: 'cmipplg9l000cdkul1qsxhzjy',
        name: 'Makan di Restoran',
      },
      {
        id: 'cmipplg9m000edkuld3pefdjs',
        name: 'Wisata',
      },
    ],
  },
  {
    id: 'cmipplg9n000fdkul57f4in1z',
    name: 'Keseharian',
    subcategories: [
      {
        id: 'cmipplg9o000hdkulqk6yf9x7',
        name: 'Bank',
      },
      {
        id: 'cmipplg9p000jdkulchexa66a',
        name: 'Di Apartemen',
      },
      {
        id: 'cmipplg9q000ldkul91s0fxkx',
        name: 'Di Rumah',
      },
      {
        id: 'cmipplg9r000ndkulswfko93u',
        name: 'Gym',
      },
      {
        id: 'cmipplg9s000pdkul7lpvlp5v',
        name: 'Ke Dokter',
      },
      {
        id: 'cmipplg9s000rdkulat0ihgou',
        name: 'Kuliner',
      },
      {
        id: 'cmipplg9t000tdkulbpo6gxgl',
        name: 'Olahraga',
      },
      {
        id: 'cmipplg9u000vdkulo1b04kw3',
        name: 'Salon',
      },
      {
        id: 'cmipplg9v000xdkulrs59tnnr',
        name: 'Sekolah / Kampus',
      },
      {
        id: 'cmipplg9w000zdkulrn15s0ej',
        name: 'Transportasi Umum',
      },
    ],
  },
  {
    id: 'cmipplg9x0010dkul2zvyldgq',
    name: 'Pekerjaan',
    subcategories: [
      {
        id: 'cmipplg9x0012dkulm1ka8ao4',
        name: 'Bekerja',
      },
      {
        id: 'cmipplg9y0014dkulqty8g4bf',
        name: 'Bisnis',
      },
      {
        id: 'cmipplg9z0016dkuldilj9f2l',
        name: 'Interview',
      },
      {
        id: 'cmipplga00018dkultirq8atr',
        name: 'Kantor',
      },
      {
        id: 'cmipplga1001adkulwms3dc2v',
        name: 'Meeting',
      },
      {
        id: 'cmipplga2001cdkul5q4piv4v',
        name: 'Networking',
      },
    ],
  },
];

export async function seedCategories() {
  console.log('Seeding categories and subcategories...');

  for (const categoryData of categoriesData) {
    const category = await prisma.taskCategory.upsert({
      where: { id: categoryData.id },
      update: { name: categoryData.name },
      create: {
        id: categoryData.id,
        name: categoryData.name,
      },
    });
    console.log(`✓ Category: ${category.name}`);

    for (const sub of categoryData.subcategories) {
      await prisma.taskSubcategory.upsert({
        where: { id: sub.id },
        update: {
          name: sub.name,
          categoryId: category.id,
        },
        create: {
          id: sub.id,
          name: sub.name,
          categoryId: category.id,
        },
      });
      console.log(`  ✓ Subcategory: ${sub.name}`);
    }
  }

  console.log('✅ Categories seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  seedCategories()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

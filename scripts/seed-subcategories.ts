import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  console.log('Seeding categories and subcategories...');

  // Define categories with their subcategories
  const categoriesWithSubcategories = [
    {
      name: 'Jalan-jalan',
      subcategories: [
        'Belanja',
        'Di Bandara',
        'Di Hotel',
        'Di Stasiun',
        'Jalan-jalan',
        'Makan di Restoran',
        'Wisata',
      ],
    },
    {
      name: 'Keseharian',
      subcategories: [
        'Bank',
        'Di Apartemen',
        'Di Rumah',
        'Gym',
        'Ke Dokter',
        'Kuliner',
        'Olahraga',
        'Salon',
        'Sekolah / Kampus',
        'Transportasi Umum',
      ],
    },
    {
      name: 'Pekerjaan',
      subcategories: ['Bekerja', 'Bisnis', 'Interview', 'Kantor', 'Meeting', 'Networking'],
    },
  ];

  console.log('\nSeeding categories and subcategories...');
  const createdCategories: Record<string, string> = {};

  for (const categoryData of categoriesWithSubcategories) {
    try {
      // Create or update category
      const category = await prisma.taskCategory.upsert({
        where: { name: categoryData.name },
        update: {},
        create: { name: categoryData.name },
      });
      createdCategories[category.name] = category.id;
      console.log(`✓ Created/Updated category: ${category.name}`);

      // Create subcategories for this category
      for (const subcategoryName of categoryData.subcategories) {
        try {
          const subcategory = await prisma.taskSubcategory.upsert({
            where: {
              name_categoryId: {
                name: subcategoryName,
                categoryId: category.id,
              },
            },
            update: {},
            create: {
              name: subcategoryName,
              categoryId: category.id,
            },
          });
          console.log(`  ✓ Created/Updated subcategory: ${subcategory.name}`);
        } catch (error) {
          console.error(`  ✗ Error creating subcategory ${subcategoryName}:`, error);
        }
      }
    } catch (error) {
      console.error(`✗ Error creating category ${categoryData.name}:`, error);
    }
  }

  // Summary
  const totalCategories = await prisma.taskCategory.count();
  const totalSubcategories = await prisma.taskSubcategory.count();
  console.log(`\n✅ Seeding complete!`);
  console.log(`   Total categories: ${totalCategories}`);
  console.log(`   Total subcategories: ${totalSubcategories}`);
}

seedData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

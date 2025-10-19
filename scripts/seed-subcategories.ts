import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  console.log('Seeding categories and subcategories...');

  // Seed Categories
  const categories = [
    { name: 'Restaurant' },
    { name: 'Shopping' },
    { name: 'Travel' },
    { name: 'Workplace' },
    { name: 'Daily Life' },
    { name: 'Social' },
  ];

  console.log('\nSeeding categories...');
  const createdCategories: Record<string, string> = {};

  for (const category of categories) {
    try {
      const created = await prisma.taskCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
      createdCategories[created.name] = created.id;
      console.log(`✓ Created/Updated category: ${created.name}`);
    } catch (error) {
      console.error(`✗ Error creating category ${category.name}:`, error);
    }
  }

  // Seed Subcategories for Travel category
  const travelId = createdCategories['Travel'];
  if (travelId) {
    const subcategories = [
      { name: 'Jalan-jalan', categoryId: travelId },
      { name: 'Keseharian', categoryId: createdCategories['Daily Life'] },
      { name: 'Pekerjaan', categoryId: createdCategories['Workplace'] },
    ];

    console.log('\nSeeding subcategories...');
    for (const subcategory of subcategories) {
      try {
        const created = await prisma.taskSubcategory.upsert({
          where: {
            name_categoryId: {
              name: subcategory.name,
              categoryId: subcategory.categoryId,
            },
          },
          update: {},
          create: subcategory,
        });
        console.log(`✓ Created/Updated subcategory: ${created.name}`);
      } catch (error) {
        console.error(`✗ Error creating subcategory ${subcategory.name}:`, error);
      }
    }
  }

  console.log('\nSeeding complete!');
}

seedData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

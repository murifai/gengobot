-- Seed initial subcategories
-- This script adds the three main subcategories: Jalan-jalan, Keseharian, Pekerjaan

INSERT INTO "TaskSubcategory" (id, name, "nameJp", "nameEn", description, category, "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid()::text,
    'Jalan-jalan',
    '旅行',
    'Travel',
    'Tasks related to traveling, going out, and exploring places',
    'general',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid()::text,
    'Keseharian',
    '日常生活',
    'Daily Life',
    'Tasks related to everyday activities and daily routines',
    'general',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid()::text,
    'Pekerjaan',
    '仕事',
    'Work',
    'Tasks related to work, business, and professional activities',
    'general',
    3,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

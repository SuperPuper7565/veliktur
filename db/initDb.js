const fs = require('fs');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'veliktur.sqlite');

const schemaPath = path.join(__dirname, 'schema.sql');

const categories = [
  { name: 'Детские', slug: 'kids' },
  { name: 'Городские', slug: 'city' },
  { name: 'Горные', slug: 'mountain' },
  { name: 'Гибридные', slug: 'hybrid' }
];

const brands = ['VelikTur', 'Trek', 'Giant', 'Merida'];
const frameMaterials = ['Алюминий', 'Карбон', 'Сталь'];
const brakeTypes = ['Дисковые гидравлические', 'Дисковые механические', 'Ободные'];

const products = [
  {
    name: 'Kids Rocket 20',
    categorySlug: 'kids',
    brand: 'VelikTur',
    price: 32900,
    wheelDiameter: 20,
    speedsCount: 7,
    frameMaterial: 'Алюминий',
    brakeType: 'Ободные',
    targetGender: 'boys',
    ageGroup: '6-8',
    rating: 4.7,
    image: '/images/bike-city.svg',
    isBestSeller: 1
  },
  {
    name: 'Kids Star 16',
    categorySlug: 'kids',
    brand: 'VelikTur',
    price: 28900,
    wheelDiameter: 16,
    speedsCount: 1,
    frameMaterial: 'Сталь',
    brakeType: 'Ободные',
    targetGender: 'girls',
    ageGroup: '3-5',
    rating: 4.6,
    image: '/images/bike-city.svg',
    isBestSeller: 0
  },
  {
    name: 'City Glide 3',
    categorySlug: 'city',
    brand: 'Giant',
    price: 55800,
    wheelDiameter: 26,
    speedsCount: 7,
    frameMaterial: 'Сталь',
    brakeType: 'Дисковые механические',
    targetGender: 'women',
    ageGroup: null,
    rating: 4.5,
    image: '/images/bike-city.svg',
    isBestSeller: 0
  },
  {
    name: 'Storm Urban X1',
    categorySlug: 'city',
    brand: 'Trek',
    price: 64900,
    wheelDiameter: 27.5,
    speedsCount: 21,
    frameMaterial: 'Алюминий',
    brakeType: 'Дисковые гидравлические',
    targetGender: 'men',
    ageGroup: null,
    rating: 4.8,
    image: '/images/bike-city.svg',
    isBestSeller: 1
  },
  {
    name: 'Ridge Trail Pro',
    categorySlug: 'mountain',
    brand: 'Merida',
    price: 78900,
    wheelDiameter: 29,
    speedsCount: 24,
    frameMaterial: 'Карбон',
    brakeType: 'Дисковые гидравлические',
    targetGender: 'men',
    ageGroup: null,
    rating: 4.9,
    image: '/images/bike-mountain.svg',
    isBestSeller: 1
  },
  {
    name: 'Peak Enduro ZX',
    categorySlug: 'mountain',
    brand: 'Trek',
    price: 119900,
    wheelDiameter: 29,
    speedsCount: 12,
    frameMaterial: 'Карбон',
    brakeType: 'Дисковые гидравлические',
    targetGender: 'women',
    ageGroup: null,
    rating: 5.0,
    image: '/images/bike-mountain.svg',
    isBestSeller: 1
  },
  {
    name: 'Hybrid Flow M',
    categorySlug: 'hybrid',
    brand: 'VelikTur',
    price: 68400,
    wheelDiameter: 28,
    speedsCount: 18,
    frameMaterial: 'Алюминий',
    brakeType: 'Дисковые механические',
    targetGender: 'men',
    ageGroup: null,
    rating: 4.6,
    image: '/images/bike-hybrid.svg',
    isBestSeller: 0
  },
  {
    name: 'Sprint Hybrid S',
    categorySlug: 'hybrid',
    brand: 'Giant',
    price: 70200,
    wheelDiameter: 28,
    speedsCount: 18,
    frameMaterial: 'Алюминий',
    brakeType: 'Дисковые гидравлические',
    targetGender: 'women',
    ageGroup: null,
    rating: 4.7,
    image: '/images/bike-hybrid.svg',
    isBestSeller: 0
  }
];

const insertReferenceData = async (db) => {
  for (const category of categories) {
    await db.run('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)', [
      category.name,
      category.slug
    ]);
  }

  for (const brand of brands) {
    await db.run('INSERT OR IGNORE INTO brands (name) VALUES (?)', [brand]);
  }

  for (const material of frameMaterials) {
    await db.run('INSERT OR IGNORE INTO frame_materials (name) VALUES (?)', [material]);
  }

  for (const brakeType of brakeTypes) {
    await db.run('INSERT OR IGNORE INTO brake_types (name) VALUES (?)', [brakeType]);
  }
};

const resolveId = async (db, table, field, value) => {
  const row = await db.get(`SELECT id FROM ${table} WHERE ${field} = ?`, [value]);
  return row ? row.id : null;
};

const seedProducts = async (db) => {
  await db.run('DELETE FROM products');

  for (const product of products) {
    const categoryId = await resolveId(db, 'categories', 'slug', product.categorySlug);
    const brandId = await resolveId(db, 'brands', 'name', product.brand);
    const frameMaterialId = await resolveId(
      db,
      'frame_materials',
      'name',
      product.frameMaterial
    );
    const brakeTypeId = await resolveId(db, 'brake_types', 'name', product.brakeType);

    await db.run(
      `
      INSERT INTO products (
        name,
        category_id,
        brand_id,
        price,
        wheel_diameter,
        speeds_count,
        frame_material_id,
        brake_type_id,
        target_gender,
        age_group,
        rating,
        image,
        is_best_seller
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product.name,
        categoryId,
        brandId,
        product.price,
        product.wheelDiameter,
        product.speedsCount,
        frameMaterialId,
        brakeTypeId,
        product.targetGender,
        product.ageGroup,
        product.rating,
        product.image,
        product.isBestSeller
      ]
    );
  }
};

const initDatabase = async () => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  await db.exec(schemaSql);
  await insertReferenceData(db);
  await seedProducts(db);

  const countRow = await db.get('SELECT COUNT(*) as total FROM products');
  console.log(`Database initialized: ${dbPath}`);
  console.log(`Products seeded: ${countRow.total}`);

  await db.close();
};

module.exports = {
  initDatabase,
  dbPath
};

if (require.main === module) {
  initDatabase().catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });
}




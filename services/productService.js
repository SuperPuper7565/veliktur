const { getDb } = require('../db/client');

const baseSelect = `
  SELECT
    p.id,
    p.name,
    c.slug AS category,
    c.name AS categoryName,
    b.name AS brand,
    p.price,
    p.rating,
    p.speeds_count AS speed,
    p.wheel_diameter AS wheelDiameter,
    fm.name AS frame,
    bt.name AS brakeType,
    p.target_gender AS targetGender,
    p.age_group AS ageGroup,
    p.image,
    CASE WHEN p.is_best_seller = 1 THEN 1 ELSE 0 END AS isBestSeller
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
  INNER JOIN brands b ON b.id = p.brand_id
  INNER JOIN frame_materials fm ON fm.id = p.frame_material_id
  INNER JOIN brake_types bt ON bt.id = p.brake_type_id
`;

const mapProduct = (item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  categoryName: item.categoryName,
  brand: item.brand,
  price: item.price,
  rating: item.rating,
  speed: String(item.speed),
  wheel: `${item.wheelDiameter}\"`,
  frame: item.frame,
  brakeType: item.brakeType,
  targetGender: item.targetGender,
  ageGroup: item.ageGroup,
  image: item.image,
  isBestSeller: Boolean(item.isBestSeller)
});

const buildFilterQuery = ({
  category,
  search,
  brand,
  wheel,
  speeds,
  frame,
  brakeType,
  targetGender,
  ageGroup,
  maxPrice
}) => {
  const where = [];
  const params = [];

  if (category && category !== 'all') {
    where.push('c.slug = ?');
    params.push(category);
  }

  if (search && search.trim()) {
    where.push('LOWER(p.name) LIKE ?');
    params.push(`%${search.toLowerCase().trim()}%`);
  }

  if (brand && brand !== 'all') {
    where.push('b.name = ?');
    params.push(brand);
  }

  if (wheel && wheel !== 'all') {
    where.push('p.wheel_diameter = ?');
    params.push(Number(wheel));
  }

  if (speeds && speeds !== 'all') {
    where.push('p.speeds_count = ?');
    params.push(Number(speeds));
  }

  if (frame && frame !== 'all') {
    where.push('fm.name = ?');
    params.push(frame);
  }

  if (brakeType && brakeType !== 'all') {
    where.push('bt.name = ?');
    params.push(brakeType);
  }

  if (targetGender && targetGender !== 'all') {
    where.push('p.target_gender = ?');
    params.push(targetGender);
  }

  if (ageGroup && ageGroup !== 'all') {
    where.push('p.age_group = ?');
    params.push(ageGroup);
  }

  if (maxPrice) {
    where.push('p.price <= ?');
    params.push(Number(maxPrice));
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return { whereClause, params };
};

exports.getAllProducts = async () => {
  const db = await getDb();
  const rows = await db.all(`${baseSelect} ORDER BY p.id ASC`);
  return rows.map(mapProduct);
};

exports.getFilteredProducts = async (filters) => {
  const db = await getDb();
  const { whereClause, params } = buildFilterQuery(filters);
  const rows = await db.all(
    `${baseSelect} ${whereClause} ORDER BY p.price ASC, p.id ASC`,
    params
  );

  return rows.map(mapProduct);
};


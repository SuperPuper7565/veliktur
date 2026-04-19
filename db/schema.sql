PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS frame_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS brake_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  brand_id INTEGER NOT NULL,
  price INTEGER NOT NULL,
  wheel_diameter REAL NOT NULL,
  speeds_count INTEGER NOT NULL,
  frame_material_id INTEGER NOT NULL,
  brake_type_id INTEGER NOT NULL,
  target_gender TEXT NOT NULL,
  age_group TEXT,
  rating REAL DEFAULT 0,
  image TEXT,
  is_best_seller INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  FOREIGN KEY (frame_material_id) REFERENCES frame_materials(id),
  FOREIGN KEY (brake_type_id) REFERENCES brake_types(id)
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_wheel_diameter ON products(wheel_diameter);
CREATE INDEX IF NOT EXISTS idx_products_speeds_count ON products(speeds_count);
CREATE INDEX IF NOT EXISTS idx_products_frame_material_id ON products(frame_material_id);
CREATE INDEX IF NOT EXISTS idx_products_brake_type_id ON products(brake_type_id);
CREATE INDEX IF NOT EXISTS idx_products_target_gender ON products(target_gender);
CREATE INDEX IF NOT EXISTS idx_products_age_group ON products(age_group);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);


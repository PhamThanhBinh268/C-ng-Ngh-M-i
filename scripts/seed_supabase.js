const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function slugify(value) {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function loadSeedData() {
  const dataPath = path.join(__dirname, '..', 'src', 'lib', 'data.ts');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const jsContent = raw.replace(/export const/g, 'const') + '\nmodule.exports = { PRODUCTS, CATEGORIES };\n';
  const tempPath = path.join(__dirname, '..', 'temp_seed_data.js');
  fs.writeFileSync(tempPath, jsContent, 'utf-8');
  const seed = require(tempPath);
  fs.unlinkSync(tempPath);
  return seed;
}

async function upsertCategories(categories) {
  const rows = categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug || slugify(cat.name),
    image_url: cat.image || null,
    color: cat.color || null,
    icon: cat.icon || null
  }));

  const { error: upsertError } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'slug' });

  if (upsertError) {
    throw upsertError;
  }

  const { data, error: selectError } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (selectError) {
    throw selectError;
  }

  const map = new Map();
  data.forEach((cat) => {
    map.set(cat.name, cat.id);
  });
  return map;
}

async function upsertProducts(products, categoryIdByName) {
  const rows = products.map((product) => ({
    name: product.name,
    slug: slugify(product.name),
    description: product.description || null,
    price: product.price || 0,
    original_price: product.originalPrice || product.price || 0,
    stock: product.stock || 0,
    image_url: product.image_url || null,
    age_range: product.age || null,
    brand: product.brand || null,
    rating: product.rating ? Number(product.rating) : null,
    reviews: Number.isFinite(product.reviews) ? product.reviews : null,
    is_new: Boolean(product.isNew),
    is_sale: Boolean(product.isSale),
    category_id: categoryIdByName.get(product.category) || null
  }));

  const { error } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'slug' });

  if (error) {
    throw error;
  }
}

async function run() {
  console.log('Loading seed data...');
  const { PRODUCTS, CATEGORIES } = loadSeedData();

  console.log('Upserting categories...');
  const categoryIdByName = await upsertCategories(CATEGORIES);

  console.log('Upserting products...');
  await upsertProducts(PRODUCTS, categoryIdByName);

  console.log('Done.');
}

run().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

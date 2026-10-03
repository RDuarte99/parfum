const pool = require('../db/pool');

const fallbackProducts = [
  { id: 1, name: 'Perfume Floral', brand: 'AromaLux', group_name: 'Perfumería', price: 120 },
  { id: 2, name: 'Crema Hidratante', brand: 'BelleSkin', group_name: 'Cosmética', price: 45 },
  { id: 3, name: 'Labial Mate', brand: 'ColorPro', group_name: 'Cosmética', price: 35 },
  { id: 4, name: 'Fragancia Intensa', brand: 'AromaLux', group_name: 'Perfumería', price: 180 },
  { id: 5, name: 'Set Cuidado Facial', brand: 'BelleSkin', group_name: 'Cuidado Personal', price: 95 },
  { id: 6, name: 'Colonia Fresh', brand: 'NaturaPlus', group_name: 'Perfumería', price: 70 }
];

let dbAvailable = true;

async function initializeProducts() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        group_name TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
      )
    `);

    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (countResult.rows[0].count === 0) {
      for (const product of fallbackProducts) {
        await pool.query(
          'INSERT INTO products (name, brand, group_name, price) VALUES ($1, $2, $3, $4)',
          [product.name, product.brand, product.group_name, product.price]
        );
      }
    }
  } catch (_error) {
    dbAvailable = false;
  }
}

function applyFallbackFilters(products, filters = {}) {
  return products.filter((product) => {
    if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) return false;
    if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.groupName && product.group_name !== filters.groupName) return false;
    return true;
  });
}

async function getProducts(filters = {}) {
  if (!dbAvailable) {
    const filtered = applyFallbackFilters(fallbackProducts, filters);
    return typeof filters.limit === 'number' ? filtered.slice(0, filters.limit) : filtered;
  }

  const whereClauses = [];
  const values = [];
  let paramIndex = 1;

  if (typeof filters.minPrice === 'number') {
    whereClauses.push(`price >= $${paramIndex++}`);
    values.push(filters.minPrice);
  }
  if (typeof filters.maxPrice === 'number') {
    whereClauses.push(`price <= $${paramIndex++}`);
    values.push(filters.maxPrice);
  }
  if (filters.brand) {
    whereClauses.push(`brand = $${paramIndex++}`);
    values.push(filters.brand);
  }
  if (filters.groupName) {
    whereClauses.push(`group_name = $${paramIndex++}`);
    values.push(filters.groupName);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const limit = typeof filters.limit === 'number' ? `LIMIT ${Math.max(1, Math.floor(filters.limit))}` : '';
  const result = await pool.query(
    `SELECT id, name, brand, group_name, price::float AS price FROM products ${where} ORDER BY id ${limit}`,
    values
  );
  return result.rows;
}

async function getProductById(id) {
  if (!dbAvailable) {
    return fallbackProducts.find((product) => product.id === id);
  }

  const result = await pool.query(
    'SELECT id, name, brand, group_name, price::float AS price FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  initializeProducts,
  getProducts,
  getProductById
};

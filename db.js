const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const USE_PG = !!process.env.DATABASE_URL;

let pool;
if (USE_PG) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  pool.query(`
    CREATE TABLE IF NOT EXISTS produk (
      id       SERIAL PRIMARY KEY,
      nama     VARCHAR(255) NOT NULL,
      kategori VARCHAR(100),
      stok     INTEGER DEFAULT 0,
      harga    BIGINT DEFAULT 0
    )
  `)
  .then(() => console.log('✅ Tabel produk siap'))
  .catch(e => console.error('❌ Error:', e.message));
}

function read()      { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function write(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

const db = {
  async getAll() {
    if (USE_PG) return (await pool.query('SELECT * FROM produk ORDER BY id')).rows;
    return read().produk;
  },
  async getById(id) {
    if (USE_PG) return (await pool.query('SELECT * FROM produk WHERE id=$1', [id])).rows[0] || null;
    return read().produk.find(p => p.id === +id) || null;
  },
  async create({ nama, kategori, stok, harga }) {
    if (USE_PG) return (await pool.query(
      'INSERT INTO produk (nama,kategori,stok,harga) VALUES ($1,$2,$3,$4) RETURNING *',
      [nama, kategori, +stok||0, +harga||0]
    )).rows[0];
    const d = read();
    const item = { id: ++d.lastId, nama, kategori, stok: +stok||0, harga: +harga||0 };
    d.produk.push(item); write(d); return item;
  },
  async update(id, { nama, kategori, stok, harga }) {
    if (USE_PG) return (await pool.query(
      'UPDATE produk SET nama=$1,kategori=$2,stok=$3,harga=$4 WHERE id=$5 RETURNING *',
      [nama, kategori, +stok||0, +harga||0, id]
    )).rows[0] || null;
    const d = read();
    const i = d.produk.findIndex(p => p.id === +id);
    if (i === -1) return null;
    d.produk[i] = { ...d.produk[i], nama, kategori, stok: +stok||0, harga: +harga||0 };
    write(d); return d.produk[i];
  },
  async delete(id) {
    if (USE_PG) return (await pool.query('DELETE FROM produk WHERE id=$1 RETURNING *', [id])).rows[0] || null;
    const d = read();
    const i = d.produk.findIndex(p => p.id === +id);
    if (i === -1) return null;
    const del = d.produk.splice(i, 1)[0]; write(d); return del;
  }
};

module.exports = db;

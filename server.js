const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/api/produk', async (req, res) => {
  try { res.json({ success: true, data: await db.getAll() }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/produk/:id', async (req, res) => {
  try {
    const item = await db.getById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/produk', async (req, res) => {
  try {
    const { nama, kategori, stok, harga } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
    res.status(201).json({ success: true, data: await db.create({ nama, kategori, stok, harga }) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.put('/api/produk/:id', async (req, res) => {
  try {
    const { nama, kategori, stok, harga } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama wajib diisi' });
    const item = await db.update(req.params.id, { nama, kategori, stok, harga });
    if (!item) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete('/api/produk/:id', async (req, res) => {
  try {
    const item = await db.delete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    res.json({ success: true, message: 'Berhasil dihapus' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  console.log(`💾 Mode: ${process.env.DATABASE_URL ? '🐘 PostgreSQL' : '📄 JSON lokal'}`);
});

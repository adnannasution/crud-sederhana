const { test, expect } = require('@playwright/test');

const URL = 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

test('halaman load dan tabel muncul', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Manajemen Produk');
  await expect(page.locator('table')).toBeVisible();
});

test('tambah produk baru', async ({ page }) => {
  await page.fill('#f-nama', 'Produk Test');
  await page.selectOption('#f-kat', 'Elektronik');
  await page.fill('#f-stok', '10');
  await page.fill('#f-harga', '100000');
  await page.click('button:has-text("Simpan")');

  // Toast sukses muncul
  await expect(page.locator('#toast')).toContainText('ditambahkan');
  
  // Produk muncul di tabel
  await expect(page.locator('tbody')).toContainText('Produk Test');
});

test('edit produk', async ({ page }) => {
  // Klik tombol edit baris pertama
  await page.locator('.btn-warn').first().click();
  
  // Form terisi
  await expect(page.locator('#f-nama')).not.toHaveValue('');
  
  // Ubah nama
  await page.fill('#f-nama', 'Produk Diedit');
  await page.click('button:has-text("Simpan")');
  
  await expect(page.locator('#toast')).toContainText('diperbarui');
  await expect(page.locator('tbody')).toContainText('Produk Diedit');
});

test('hapus produk', async ({ page }) => {
  // Tangkap nama produk di baris pertama sebelum hapus
  const nama = await page.locator('tbody tr:first-child td:nth-child(2)').innerText();
  
  // Handle confirm dialog
  page.on('dialog', dialog => dialog.accept());
  await page.locator('.btn-danger').first().click();
  
  await expect(page.locator('#toast')).toContainText('Dihapus');
  await expect(page.locator('tbody')).not.toContainText(nama);
});

test('fitur search', async ({ page }) => {
  await page.fill('#search', 'laptop');
  await expect(page.locator('tbody')).toContainText('laptop');
  // Badge count berubah
  await expect(page.locator('#cnt')).not.toContainText('0 item');
});
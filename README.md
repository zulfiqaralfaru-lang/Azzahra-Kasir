# Azzahra Comfort Syar'i - Kasir

Aplikasi kasir: penjualan eceran, reseller, distributor, menu dan stok, kas masuk/keluar, open bill, laporan (Excel/CSV/HTML), backup dan restore, struk WhatsApp, cetak thermal Bluetooth, dan dapat dipasang di HP (PWA).

## File
- `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`
- `Image/logo.png` (logo), `icons/` (ikon aplikasi 192 dan 512)

## Warna dan font
Token warna dan font ada di `:root` bagian atas `style.css` (ungu dari logo, font Poppins). Struk memakai font monospace supaya kolom rata.

## Penyimpanan data
Data tersimpan di browser dan disinkronkan ke tabel `kasir_data` di Supabase pada baris `id = "azzahra"` (terpisah dari aplikasi Kopi Tutug). Login memakai akun Supabase Auth.

## Deploy
Unggah semua file ke repo GitHub baru, lalu import di Vercel (Framework Preset: Other).

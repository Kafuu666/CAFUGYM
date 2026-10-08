# CAFU GYM

Aplikasi manajemen gym: member memilih paket, membayar, dan memantau membership; admin mengelola member, paket, membership, dan pembayaran.

- `backend/`  Express.js + MySQL/MariaDB + JWT (REST API)
- `frontend/` React + Vite
- `database/` file SQL (`cafu_gym.sql`): skema 5 tabel + data awal

## Menjalankan (development)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # isi DB_PASSWORD (jika ada) dan JWT_SECRET
npm run migrate && npm run seed
npm start                   # http://localhost:5000/api

# 2. Frontend (terminal lain)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Akun contoh: `admin@cafu.com / admin123` dan `cafu@gmail.com / 123456`.
Detail endpoint dan aturan bisnis ada di `backend/README.md`, struktur frontend di `frontend/README.md`.

## Database (MariaDB)

Pilih salah satu cara membuat database `cafu_gym`:

**A. Impor file SQL** (cocok untuk tugas / phpMyAdmin)
- phpMyAdmin: tab *Import* → pilih `database/cafu_gym.sql` → *Go*
- Terminal: `mysql -u root -p < database/cafu_gym.sql`

**B. Lewat backend:** `cd backend && npm run migrate && npm run seed`

Lalu sambungkan: isi `backend/.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=cafu_gym`) dan jalankan `npm start`.
Koneksi dibuat di `backend/src/config/database.js`; jika berhasil, terminal menampilkan
"CAFU GYM API berjalan…", jika gagal muncul "Tidak dapat terhubung ke database".

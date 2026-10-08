# CAFU GYM – Frontend

React 18 + Vite + React Router. Tampilan mobile-first (member) dan responsif (admin), mengikuti mode terang/gelap perangkat.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (request /api otomatis diteruskan ke http://localhost:5000)
npm run build      # hasil di dist/
```

Backend harus aktif lebih dulu (lihat ../backend/README.md). Akun contoh setelah seed: `cafu@gmail.com / 123456` (member) dan `admin@cafu.com / admin123` (admin); saat `npm run dev`, tombol pengisi cepat muncul di halaman login.

## Struktur

```
src/
  services/api.js        semua panggilan Fetch ke backend + penyimpanan token
  context/AuthContext    user, login, register, logout, pemulihan sesi
  routes/AppRoutes.jsx   rute publik / member / admin + penjaga role
  hooks/useLoad.js       memuat data async (loading, error, reload)
  components/            Button, Card, Input, Tag, Modal, Toast, Navbar, Layout, Splash, CrudPage, MemberCard, CardModal
  pages/                 Login, Register, Dashboard, Packages, Membership, Payments (pilih QRIS/Tunai), MyCard (kartu member), Profile
  pages/admin/           Dashboard, Members, Packages, Memberships, Payments (memakai CrudPage)
```

## Catatan

- **QRIS:** ganti `public/qris.svg` (saat ini hanya gambar contoh) dengan QRIS gym Anda, atau isi `VITE_QRIS_IMAGE` di `.env`.
- **Kartu member:** member melihat kartunya di menu *Kartu* setelah pembayaran lunas. Admin mencetaknya dari *Member → Kartu → Cetak kartu* (ukuran cetak 85,6 × 54 mm; aktifkan "Background graphics" di dialog cetak browser agar warna kartu ikut tercetak).
- **Hapus member:** tombol Hapus hanya aktif untuk member tidak aktif; filter *Tidak aktif* tersedia di halaman Member.

- **Token JWT** disimpan di `localStorage` (kunci `cafu_token`) agar sesi bertahan setelah refresh. Jika server menjawab 401, sesi otomatis dibersihkan dan user kembali ke login.
- **Halaman CRUD admin** dibuat dari satu komponen `CrudPage`; tiap halaman hanya mendefinisikan daftar field. Untuk menambah field, cukup tambah satu baris di array `fields` halaman terkait.
- **Produksi:** salin `.env.example` menjadi `.env` dan isi `VITE_API_URL` dengan alamat API lengkap, lalu atur `CORS_ORIGIN` di backend ke alamat frontend.

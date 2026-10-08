# CAFU GYM – Backend

REST API untuk aplikasi manajemen gym: Node.js + Express.js, MySQL/MariaDB, JWT, bcrypt.

## Menjalankan

```bash
cd backend
npm install
cp .env.example .env      # lalu isi DB_* dan JWT_SECRET
npm run migrate           # buat database cafu_gym + 5 tabel (migrate:fresh = ulang dari nol).
                          # Database lama otomatis ditambah kolom payments.method
npm run seed              # data awal: admin, 3 member, 4 paket
npm start                 # http://localhost:5000/api   (npm run dev untuk auto-reload)
npm test                  # smoke test 53 skenario (server harus aktif)
```

Akun contoh setelah seed: `admin@cafu.com / admin123` dan `cafu@gmail.com / 123456`.
Buat JWT_SECRET acak: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Format respons

- Login/register: `{ "token": "...", "user": { id, name, email, role } }`
- Baca: `{ "data": ... }` (daftar = array, detail = objek)
- Tambah/ubah: `{ "message": "...", "data": ... }`, hapus: `{ "message": "..." }`
- Error: `{ "message": "...", "errors": { field: "alasan" } }` dengan status 400/401/403/404/409/422/500
- Header privat: `Authorization: Bearer <token>`

## Endpoint

| Method | Endpoint | Akses |
| --- | --- | --- |
| POST | /api/auth/register, /api/auth/login | Publik |
| GET | /api/auth/profile | JWT |
| GET, POST | /api/members | Admin |
| GET, PUT, DELETE | /api/members/:id | Admin (DELETE hanya untuk member tidak aktif) |
| GET | /api/cards/me | Member — kartu sendiri (`data: null` jika belum terbit) |
| GET | /api/cards/:memberId | Admin — kartu member untuk dicetak |
| GET | /api/packages, /api/packages/:id | JWT |
| POST, PUT, DELETE | /api/packages, /api/packages/:id | Admin |
| GET, POST | /api/memberships | JWT (member hanya melihat miliknya) |
| GET | /api/memberships/:id | JWT (pemilik/admin) |
| PUT, DELETE | /api/memberships/:id | Admin |
| GET, POST | /api/payments | JWT (member hanya miliknya) |
| GET | /api/payments/:id | JWT (pemilik/admin) |
| PUT, DELETE | /api/payments/:id | Admin |
| PATCH | /api/payments/:id/pay | JWT (pemilik/admin) — body `{ "method": "QRIS" \| "CASH" }` — tambahan |
| GET | /api/stats | Admin — tambahan |

## Perilaku yang perlu diketahui

- **Member memilih paket** (`POST /api/memberships` dengan `{ "package_id": 2 }`): dibuat membership `PENDING` dan tagihan `PENDING` sekaligus (satu transaksi). Tanggal berakhir = hari ini + durasi paket. Admin bisa mengirim `member_id`, tanggal, dan status sendiri.
- **Pembayaran lunas** (lewat `PATCH /payments/:id/pay` atau admin mengubah status ke `PAID`) mengubah membership `PENDING` menjadi `ACTIVE`.
- **Metode pembayaran** (`payments.method`: `QRIS` / `CASH`). `PATCH /payments/:id/pay` wajib berisi `method`:
  - Admin: selalu melunasi (menerima tunai di kasir / memastikan dana QRIS sudah masuk).
  - Member + `CASH`: metode dicatat, status tetap `PENDING` sampai admin mengonfirmasi di kasir.
  - Member + `QRIS`: langsung `PAID` bila `QRIS_AUTO_CONFIRM=true` (default, simulasi tanpa payment gateway). Isi `false` agar menunggu konfirmasi admin; disarankan untuk produksi karena sistem tidak memverifikasi dana QRIS secara otomatis.
  - Admin yang mencatat/mengubah pembayaran menjadi `PAID` wajib menyertakan `method`.
- **Kartu member**: terbit otomatis setelah member punya pembayaran lunas. Nomor member = `CAFU-` + id member 5 digit (mis. `CAFU-00007`). Data kartu diambil dari membership terbaru yang sudah dibayar (paket, masa berlaku, status Aktif/Berakhir).
- **Menghapus member**: hanya member **tidak aktif** (tidak punya membership `ACTIVE`) yang bisa dihapus; member aktif ditolak dengan **409**. Penghapusan ikut menghapus seluruh riwayat membership dan pembayaran member itu (satu transaksi), sehingga angka pendapatan di dashboard ikut berkurang. Daftar member menyertakan `is_active`, `has_paid`, dan `member_code`.
- Membership `ACTIVE` yang lewat `end_date` otomatis menjadi `EXPIRED` (saat server start, tiap jam, dan saat daftar membership/statistik dibuka).
- `member_id` pada membership adalah `members.id`, bukan `users.id`. Keduanya ada di `GET /api/auth/profile` (`id` dan `member_id`).
- Menghapus paket/membership yang masih dipakai data lain ditolak dengan **409** (relasi RESTRICT) agar riwayat pembayaran tidak hilang. Pengecualian: member tidak aktif (lihat di atas).
- Token divalidasi ke database di setiap request, jadi token milik akun yang sudah dihapus langsung ditolak.

## Tambahan di luar PRD

`PATCH /api/payments/:id/pay` (simulasi tombol "Bayar sekarang" tanpa payment gateway) dan `GET /api/stats` (kartu statistik dashboard admin). Library hash memakai `bcryptjs` (tanpa kompilasi native); API-nya sama dengan `bcrypt`.

## Menghubungkan frontend

Ganti isi objek `api` di prototipe (`login`, `register`, `save`, `remove`) dengan `fetch` ke endpoint di atas, simpan `token` di memori/AuthContext, dan kirim header `Authorization`. Atur `CORS_ORIGIN` di `.env` ke alamat frontend (contoh `http://localhost:5173`).

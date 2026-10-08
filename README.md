# CAFU GYM

Aplikasi web manajemen keanggotaan gym. Member mendaftar, memilih paket, membayar dengan **QRIS atau Tunai**, lalu mendapat **kartu member** yang bisa dicetak admin. Admin mengelola member, paket, membership, dan pembayaran, termasuk menghapus member yang sudah tidak aktif.

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL%20%2F%20MariaDB-4479A1?logo=mysql&logoColor=white)

## Daftar isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Menjalankan (development)](#menjalankan-development)
- [Konfigurasi](#konfigurasi)
- [Pengujian](#pengujian)
- [Deploy ke server (VPS)](#deploy-ke-server-vps)
- [Ringkasan API](#ringkasan-api)
- [Aturan bisnis penting](#aturan-bisnis-penting)
- [Checklist sebelum dipakai nyata](#checklist-sebelum-dipakai-nyata)
- [Pemecahan masalah](#pemecahan-masalah)

## Fitur

**Member**
- Daftar dan masuk (JWT).
- Melihat paket gym dan memilih paket; membership dan tagihan dibuat otomatis.
- Membayar dengan **QRIS** (scan kode) atau **Tunai** (bayar di kasir).
- Dashboard dengan sisa hari membership aktif dan ringkasan pembayaran.
- **Kartu member** (nomor `CAFU-00007`, nama, paket, masa berlaku) terbit setelah pembayaran lunas.

**Admin**
- Dashboard statistik: total member, membership aktif, pendapatan, pembayaran menunggu.
- CRUD member, paket, membership, dan pembayaran.
- Menerima pembayaran tunai/QRIS dengan satu klik.
- **Mencetak kartu member** (ukuran 85,6 × 54 mm).
- Filter member Aktif / Tidak aktif dan **menghapus member tidak aktif** beserta riwayatnya.

**Sistem**
- Membership yang lewat tanggal berakhir otomatis menjadi *Berakhir* (saat server mulai, tiap jam, dan saat data dibaca).
- Operasi multi-tabel berjalan dalam transaksi database (bayar, hapus member, pilih paket).

## Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Backend | Node.js 18+, Express 4, mysql2, jsonwebtoken, bcryptjs, dotenv, cors |
| Database | MySQL atau MariaDB (InnoDB, utf8mb4) |
| Frontend | React 18, React Router 6, Vite 5, CSS murni |

## Struktur proyek

```
cafu-gym/
├── backend/
│   ├── src/
│   │   ├── app.js              # entry point Express
│   │   ├── config/             # env.js, database.js
│   │   ├── middleware/         # auth (JWT), role
│   │   ├── routes/             # auth, members, packages, memberships, payments, cards, stats
│   │   ├── controllers/        # aturan bisnis dan validasi
│   │   ├── models/             # query SQL
│   │   ├── migrations/         # pembuat tabel
│   │   ├── utils/              # validate, http, token, sql, member-code
│   │   └── seed.js             # data awal
│   ├── scripts/smoke-test.js   # uji endpoint
│   └── .env.example
├── frontend/
│   ├── public/qris.svg         # gambar QRIS (ganti dengan QRIS gym Anda)
│   ├── src/
│   │   ├── pages/              # halaman member
│   │   ├── pages/admin/        # halaman admin
│   │   ├── components/         # Button, Modal, CrudPage, MemberCard, ...
│   │   ├── context/            # AuthContext
│   │   ├── services/api.js     # semua panggilan ke backend
│   │   └── routes/AppRoutes.jsx
│   └── .env.example
├── database/cafu_gym.sql       # skema + data awal (alternatif migrasi)
└── README.md
```

## Instalasi

### Prasyarat

| Kebutuhan | Versi | Cek |
| --- | --- | --- |
| Node.js | 18 atau lebih baru | `node -v` |
| npm | bawaan Node.js | `npm -v` |
| MySQL atau MariaDB | MySQL 8 / MariaDB 10.5+ | `mysql --version` |
| Git | terbaru | `git --version` |

Pengguna Windows dapat memakai **XAMPP** atau **Laragon** untuk MySQL/MariaDB (nyalakan modul MySQL sebelum lanjut).

### 1. Ambil kode

```bash
git clone https://github.com/USERNAME/cafu-gym.git
cd cafu-gym
```

Ganti `USERNAME` dengan nama akun GitHub Anda.

### 2. Siapkan backend

```bash
cd backend
npm install
cp .env.example .env
```

Buka `backend/.env`, lalu isi minimal `DB_PASSWORD` (jika MySQL Anda memakai password) dan `JWT_SECRET`. Buat `JWT_SECRET` acak dengan:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Siapkan database

Pilih salah satu.

**A. Lewat migrasi backend (disarankan)**

```bash
npm run migrate    # membuat database cafu_gym + 5 tabel
npm run seed       # data awal: 1 admin, 3 member, 4 paket
```

`npm run migrate` aman dijalankan berulang kali: tabel yang sudah ada tidak diubah, dan kolom baru (misalnya `payments.method`) ditambahkan otomatis pada database lama.

**B. Impor file SQL** (cocok untuk phpMyAdmin)

- phpMyAdmin: tab *Import* → pilih `database/cafu_gym.sql` → *Go*.
- Terminal: `mysql -u root -p < database/cafu_gym.sql`

> File SQL berisi perintah `DROP TABLE IF EXISTS`. Jangan diimpor ke database yang sudah berisi data penting.

### 4. Siapkan frontend

```bash
cd ../frontend
npm install
```

File `.env` frontend tidak wajib saat development.

## Menjalankan (development)

Buka **dua terminal**.

**Terminal 1: backend**

```bash
cd backend
npm start          # atau: npm run dev (auto-reload saat file berubah)
```

Jika berhasil muncul: `CAFU GYM API berjalan di http://localhost:5000/api`.

**Terminal 2: frontend**

```bash
cd frontend
npm run dev
```

Buka **http://localhost:5173**. Vite meneruskan semua permintaan `/api` ke `http://localhost:5000`, jadi tidak ada masalah CORS saat development.

> Frontend memakai `npm run dev`, bukan `npm start`. Backend harus aktif lebih dulu, kalau tidak login gagal dengan error `ECONNREFUSED 127.0.0.1:5000`.

### Akun contoh (hasil seed)

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@cafu.com` | `admin123` |
| Member | `cafu@gmail.com` | `123456` |
| Member | `rina@mail.com` | `123456` |
| Member | `bagas@mail.com` | `123456` |

Saat `npm run dev`, halaman login menampilkan tombol pengisi cepat untuk akun admin dan member.

### Perintah yang tersedia

| Lokasi | Perintah | Fungsi |
| --- | --- | --- |
| `backend` | `npm start` | Jalankan API |
| `backend` | `npm run dev` | Jalankan API dengan auto-reload |
| `backend` | `npm run migrate` | Buat database dan tabel (aman diulang) |
| `backend` | `npm run migrate:fresh` | **Hapus semua tabel** lalu buat ulang |
| `backend` | `npm run seed` | Isi data awal (dilewati jika tabel `users` sudah berisi) |
| `backend` | `npm test` | Uji cepat endpoint |
| `frontend` | `npm run dev` | Server development (port 5173) |
| `frontend` | `npm run build` | Build produksi ke folder `dist/` |
| `frontend` | `npm run preview` | Coba hasil build secara lokal |

## Konfigurasi

### Backend (`backend/.env`)

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `5000` | Port API |
| `CORS_ORIGIN` | `*` | Asal frontend yang diizinkan, pisahkan koma bila lebih dari satu. **Isi dengan domain Anda di produksi** |
| `DB_HOST` | `localhost` | Host database |
| `DB_PORT` | `3306` | Port database |
| `DB_USER` | `root` | User database |
| `DB_PASSWORD` | kosong | Password database |
| `DB_NAME` | `cafu_gym` | Nama database |
| `JWT_SECRET` | wajib | String acak minimal 16 karakter. Server menolak start bila kosong |
| `JWT_EXPIRES_IN` | `7d` | Masa berlaku token login |
| `QRIS_AUTO_CONFIRM` | `true` | `true`: pembayaran QRIS member langsung lunas (simulasi). `false`: menunggu konfirmasi admin. **Gunakan `false` di produksi** |

### Frontend (`frontend/.env`, opsional)

| Variabel | Default | Keterangan |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Alamat API. Biarkan `/api` bila frontend dan API satu domain; isi URL lengkap (mis. `https://api.contoh.com/api`) bila terpisah |
| `VITE_QRIS_IMAGE` | `/qris.svg` | Gambar QRIS yang ditampilkan ke member |

Variabel `VITE_*` dibaca saat **build**. Ubah nilainya lalu jalankan `npm run build` ulang.

### Mengganti gambar QRIS

`frontend/public/qris.svg` hanya gambar contoh bertuliskan "BUKAN QRIS ASLI". Ganti dengan QRIS gym Anda: timpa file tersebut, atau taruh `qris.png` di folder `public/` dan isi `VITE_QRIS_IMAGE=/qris.png`.

## Pengujian

Smoke test menjalankan skenario end-to-end terhadap server yang sedang berjalan: login, hak akses, pilih paket, bayar QRIS dan Tunai, kartu member, dan hapus member.

```bash
cd backend
npm run migrate:fresh && npm run seed   # database bersih
npm start                               # terminal lain
npm test
```

- Jalankan hanya pada database **development**: tes membuat dan menghapus data, dan `migrate:fresh` menghapus semua tabel.
- Biarkan `QRIS_AUTO_CONFIRM=true` agar skenario QRIS member langsung lunas.
- Alamat API bisa diganti lewat `API_URL`, mis. `API_URL=http://localhost:5000/api npm test`.

## Deploy ke server (VPS)

Panduan ini untuk satu VPS Ubuntu 22.04/24.04 dengan **Nginx** (menyajikan frontend dan meneruskan `/api`), **PM2** (menjaga API tetap hidup), dan **MariaDB**. Frontend dan API berada di satu domain, jadi tidak perlu mengatur CORS lintas domain.

```
Browser ──HTTPS──► Nginx ─┬─ /      → frontend/dist (file statis)
                          └─ /api/  → Node.js :5000 → MariaDB
```

Contoh memakai domain `gym.contoh.com`. Ganti dengan domain Anda dan arahkan record DNS A domain tersebut ke IP server.

### 1. Pasang kebutuhan server

```bash
sudo apt update && sudo apt install -y nginx mariadb-server git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo mysql_secure_installation
```

### 2. Buat database dan user khusus

Jangan memakai `root` untuk aplikasi.

```bash
sudo mysql
```

```sql
CREATE DATABASE cafu_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cafu'@'localhost' IDENTIFIED BY 'GANTI-DENGAN-PASSWORD-KUAT';
GRANT ALL PRIVILEGES ON cafu_gym.* TO 'cafu'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Ambil kode dan siapkan backend

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/USERNAME/cafu-gym.git
sudo chown -R $USER:$USER /var/www/cafu-gym
cd cafu-gym/backend
npm install --omit=dev
cp .env.example .env
nano .env
```

Isi `.env` untuk produksi:

```env
PORT=5000
CORS_ORIGIN=https://gym.contoh.com

DB_HOST=localhost
DB_PORT=3306
DB_USER=cafu
DB_PASSWORD=GANTI-DENGAN-PASSWORD-KUAT
DB_NAME=cafu_gym

JWT_SECRET=<hasil perintah randomBytes di atas>
JWT_EXPIRES_IN=7d

QRIS_AUTO_CONFIRM=false
```

Buat tabel dan data awal:

```bash
npm run migrate
npm run seed
```

`seed` membuat akun demo. Ikuti langkah [mengganti password admin](#checklist-sebelum-dipakai-nyata) sebelum situs dibuka untuk umum.

### 4. Jalankan API dengan PM2

Jalankan dari folder `backend` karena `.env` dibaca dari folder kerja.

```bash
pm2 start src/app.js --name cafu-gym-api
pm2 save
pm2 startup          # jalankan perintah sudo yang ditampilkan
curl http://localhost:5000/api/health      # harus menjawab {"status":"ok"}
```

Perintah berguna: `pm2 status`, `pm2 logs cafu-gym-api`, `pm2 restart cafu-gym-api`.

### 5. Build frontend

```bash
cd /var/www/cafu-gym/frontend
npm install
npm run build        # hasil di frontend/dist
```

Tanpa `frontend/.env`, `VITE_API_URL` bernilai `/api`, cocok untuk konfigurasi satu domain di atas.

### 6. Atur Nginx

```bash
sudo nano /etc/nginx/sites-available/cafu-gym
```

```nginx
server {
    listen 80;
    server_name gym.contoh.com;

    root /var/www/cafu-gym/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Aplikasi satu halaman: semua rute lain dikembalikan ke index.html
    location / {
        try_files $uri /index.html;
    }
}
```

Aktifkan dan muat ulang:

```bash
sudo ln -s /etc/nginx/sites-available/cafu-gym /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. Aktifkan HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gym.contoh.com
```

Certbot menambahkan sertifikat dan pengalihan HTTP ke HTTPS, lalu memperbaruinya otomatis. Buka **https://gym.contoh.com** untuk mencoba.

Aktifkan juga firewall bila belum: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`. Port 5000 tidak perlu dibuka karena hanya diakses Nginx dari dalam server.

### 8. Backup database

```bash
mkdir -p ~/backup
mysqldump -u cafu -p cafu_gym > ~/backup/cafu_gym_$(date +%F).sql
```

Untuk backup harian otomatis, simpan password di `~/.my.cnf` (izin `600`) lalu tambahkan ke `crontab -e`:

```cron
0 2 * * * mysqldump cafu_gym > $HOME/backup/cafu_gym_$(date +\%F).sql
```

Salin backup ke tempat lain (bukan hanya di server yang sama).

### 9. Memperbarui aplikasi

```bash
cd /var/www/cafu-gym
git pull
cd backend  && npm install --omit=dev && npm run migrate && pm2 restart cafu-gym-api
cd ../frontend && npm install && npm run build
```

`npm run migrate` aman dijalankan setiap update: hanya menambah tabel/kolom yang belum ada. **Jangan** memakai `migrate:fresh` di produksi.

### Alternatif: frontend dan API di domain terpisah

Frontend statis (`frontend/dist`) bisa diletakkan di layanan hosting statis, sedangkan API tetap di server Anda. Atur:

1. Saat build frontend: `VITE_API_URL=https://api.contoh.com/api`
2. Di `backend/.env`: `CORS_ORIGIN=https://gym.contoh.com`
3. Hosting statis harus mengalihkan semua rute ke `index.html` (aturan *SPA fallback*), kalau tidak, memuat ulang halaman selain beranda menghasilkan 404.

## Ringkasan API

Semua endpoint berawalan `/api`. Header privat: `Authorization: Bearer <token>`. Detail lengkap ada di [`backend/README.md`](backend/README.md).

| Method | Endpoint | Akses |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | Publik |
| GET | `/auth/profile` | Login |
| GET, POST | `/members` | Admin |
| GET, PUT, DELETE | `/members/:id` | Admin (DELETE hanya member tidak aktif) |
| GET | `/packages`, `/packages/:id` | Login |
| POST, PUT, DELETE | `/packages`, `/packages/:id` | Admin |
| GET, POST | `/memberships` | Login (member hanya miliknya) |
| GET | `/memberships/:id` | Pemilik / Admin |
| PUT, DELETE | `/memberships/:id` | Admin |
| GET, POST | `/payments` | Login (member hanya miliknya) |
| GET | `/payments/:id` | Pemilik / Admin |
| PATCH | `/payments/:id/pay` dengan body `{ "method": "QRIS" \| "CASH" }` | Pemilik / Admin |
| PUT, DELETE | `/payments/:id` | Admin |
| GET | `/cards/me` | Member |
| GET | `/cards/:memberId` | Admin |
| GET | `/stats` | Admin |
| GET | `/health` | Publik |

Format respons: sukses `{ "data": ... }` atau `{ "message": "...", "data": ... }`; galat `{ "message": "...", "errors": { "field": "alasan" } }` dengan status 400, 401, 403, 404, 409, 422, atau 500.

## Aturan bisnis penting

- **Memilih paket** membuat membership *Menunggu* dan tagihan *Menunggu*; tanggal berakhir = hari ini + durasi paket.
- **Pembayaran lunas** mengubah membership *Menunggu* menjadi *Aktif*.
- **Metode bayar:**
  - Admin selalu dapat melunasi (menerima tunai di kasir atau memastikan dana QRIS masuk).
  - Member + Tunai: tetap *Menunggu* sampai admin mengonfirmasi.
  - Member + QRIS: langsung lunas bila `QRIS_AUTO_CONFIRM=true`; bila `false`, menunggu admin.
  - Pembayaran yang dicatat admin sebagai Lunas wajib menyertakan metode.
- **Kartu member** terbit setelah ada pembayaran lunas. Member hanya melihat, admin yang mencetak.
- **Member aktif** = punya minimal satu membership *Aktif*. Hanya member **tidak aktif** yang bisa dihapus, dan penghapusan ikut menghapus seluruh riwayat membership dan pembayarannya (tidak bisa dikembalikan; pendapatan di dashboard ikut berkurang).
- Paket atau membership yang masih dipakai data lain tidak bisa dihapus (409).

## Checklist sebelum dipakai nyata

- [ ] **Ganti password admin.** Akun bawaan `admin@cafu.com / admin123` diketahui publik. Buat hash baru dari folder `backend`:

  ```bash
  node -e "console.log(require('bcryptjs').hashSync('PasswordBaruYangKuat', 10))"
  ```

  lalu jalankan di database (ganti `<HASH>` dengan hasilnya, dan ubah email bila perlu):

  ```sql
  UPDATE users SET password = '<HASH>', email = 'admin@domain-anda.com' WHERE email = 'admin@cafu.com';
  ```
- [ ] Hapus akun member demo (`cafu@gmail.com`, `rina@mail.com`, `bagas@mail.com`) lewat halaman admin atau SQL.
- [ ] `JWT_SECRET` acak dan panjang; `.env` tidak masuk Git (sudah diabaikan oleh `.gitignore`).
- [ ] `CORS_ORIGIN` diisi domain Anda, bukan `*`.
- [ ] `QRIS_AUTO_CONFIRM=false`: tanpa ini, member bisa menandai QRIS lunas tanpa membayar, karena sistem tidak memverifikasi dana.
- [ ] Gambar QRIS diganti dengan QRIS gym yang asli.
- [ ] HTTPS aktif dan backup database terjadwal.

Catatan keamanan yang belum ada di aplikasi ini dan layak ditambahkan sebelum trafik tinggi: pembatasan percobaan login (`express-rate-limit`), header keamanan (`helmet`), dan paginasi pada daftar data.

## Pemecahan masalah

| Gejala | Penyebab dan solusi |
| --- | --- |
| `npm ERR! Missing script: "start"` di folder `frontend` | Frontend memakai `npm run dev`. `npm start` hanya untuk `backend`. |
| `http proxy error ... ECONNREFUSED 127.0.0.1:5000` | Backend belum jalan. Jalankan `npm start` di folder `backend`. |
| `JWT_SECRET belum diisi` saat start | Buat `backend/.env` dari `.env.example` dan isi `JWT_SECRET` (minimal 16 karakter). |
| `Tidak dapat terhubung ke database` | MySQL/MariaDB belum aktif atau `DB_USER` / `DB_PASSWORD` salah. |
| `Unknown database` atau tabel tidak ada | Jalankan `npm run migrate && npm run seed`. |
| Error terkait kolom `method` pada pembayaran | Database dibuat sebelum fitur QRIS/Tunai. Jalankan `npm run migrate` untuk menambah kolomnya. |
| Port 5000 sudah dipakai | Ubah `PORT` di `backend/.env` dan sesuaikan target proxy di `frontend/vite.config.js` (dev) atau `proxy_pass` di Nginx (produksi). |
| Produksi: halaman kosong atau 404 setelah *refresh* | Nginx belum memakai `try_files $uri /index.html;`. |
| Produksi: `502 Bad Gateway` | API mati. Cek `pm2 status` dan `pm2 logs cafu-gym-api`. |
| Produksi: error CORS di browser | `CORS_ORIGIN` tidak sama persis dengan alamat frontend (termasuk `https://`). Restart API setelah mengubahnya. |
| Frontend produksi memanggil alamat yang salah | `VITE_API_URL` dibaca saat build. Ubah lalu jalankan `npm run build` ulang. |
| Warna kartu member tidak ikut tercetak | Aktifkan opsi *Background graphics* pada dialog cetak browser. |
| Tidak bisa login setelah akun dihapus | Normal: token akun yang sudah dihapus langsung ditolak. Masuk ulang dengan akun lain. |

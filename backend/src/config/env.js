require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cafu_gym',
  },
  payment: {
    // true  : member yang memilih QRIS langsung dianggap lunas (simulasi, tanpa payment gateway).
    // false : pembayaran QRIS member menunggu konfirmasi admin (admin cek mutasi/notifikasi QRIS dulu).
    qrisAutoConfirm: process.env.QRIS_AUTO_CONFIRM !== 'false',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

if (!env.jwt.secret || env.jwt.secret.length < 16) {
  throw new Error('JWT_SECRET belum diisi (minimal 16 karakter). Isi di file .env.');
}

module.exports = env;

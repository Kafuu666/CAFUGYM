const { pool } = require('../config/database');
const { verifyToken } = require('../utils/token');
const { ApiError, asyncHandler } = require('../utils/http');

// Membaca "Authorization: Bearer <token>", memverifikasi JWT, lalu memuat user dari database
// (sehingga token milik user yang sudah dihapus otomatis ditolak). Gagal → HTTP 401.
module.exports = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Token tidak ditemukan. Silakan login.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.');
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, m.id AS member_id
       FROM users u LEFT JOIN members m ON m.user_id = u.id WHERE u.id = ?`,
    [payload.id]
  );
  if (!rows.length) throw new ApiError(401, 'Akun tidak ditemukan. Silakan login ulang.');

  req.user = rows[0];
  next();
});

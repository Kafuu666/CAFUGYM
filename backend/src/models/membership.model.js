const { pool } = require('../config/database');
const { updateById } = require('../utils/sql');

const BASE = `SELECT ms.id, ms.member_id, u.name AS member_name, ms.package_id, p.name AS package_name,
                     p.duration, p.price, ms.start_date, ms.end_date, ms.status, ms.created_at, ms.updated_at
                FROM memberships ms
                JOIN members m ON m.id = ms.member_id
                JOIN users u ON u.id = m.user_id
                JOIN gym_packages p ON p.id = ms.package_id`;

exports.list = async (memberId = null) => {
  const [rows] = memberId
    ? await pool.query(`${BASE} WHERE ms.member_id = ? ORDER BY ms.id DESC`, [memberId])
    : await pool.query(`${BASE} ORDER BY ms.id DESC`);
  return rows;
};

exports.findById = async (id, db = pool) => (await db.query(`${BASE} WHERE ms.id = ?`, [id]))[0][0] || null;

exports.create = async (db, { member_id, package_id, start_date, end_date, status = 'PENDING' }) => {
  const [r] = await db.query(
    'INSERT INTO memberships (member_id, package_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
    [member_id, package_id, start_date, end_date, status]
  );
  return r.insertId;
};

exports.update = (id, data) => updateById(pool, 'memberships', id, data);

exports.remove = async (id) => (await pool.query('DELETE FROM memberships WHERE id = ?', [id]))[0].affectedRows;

// Tanggal mulai (default hari ini) dan tanggal berakhir = mulai + N bulan.
exports.range = async (start, months) => {
  const [[r]] = await pool.query(
    'SELECT CAST(COALESCE(?, CURDATE()) AS DATE) AS start_date, CAST(DATE_ADD(COALESCE(?, CURDATE()), INTERVAL ? MONTH) AS DATE) AS end_date',
    [start || null, start || null, months]
  );
  return r;
};

// Pembayaran lunas → membership yang masih PENDING menjadi ACTIVE.
exports.activate = (db, id) => db.query("UPDATE memberships SET status = 'ACTIVE' WHERE id = ? AND status = 'PENDING'", [id]);

// Membership ACTIVE yang sudah lewat tanggal berakhir → EXPIRED.
exports.expireOutdated = async () => (await pool.query("UPDATE memberships SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND end_date < CURDATE()"))[0].affectedRows;

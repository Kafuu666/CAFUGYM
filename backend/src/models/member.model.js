const { pool, withTransaction } = require('../config/database');
const userModel = require('./user.model');
const { updateById } = require('../utils/sql');
const { memberCode } = require('../utils/member-code');

// is_active : punya membership berstatus ACTIVE.  has_paid : pernah punya pembayaran lunas (syarat terbit kartu).
const BASE = `SELECT m.id, m.user_id, u.name, u.email, m.phone, m.address,
                     EXISTS (SELECT 1 FROM memberships ms WHERE ms.member_id = m.id AND ms.status = 'ACTIVE') AS is_active,
                     EXISTS (SELECT 1 FROM memberships ms JOIN payments pay ON pay.membership_id = ms.id
                              WHERE ms.member_id = m.id AND pay.status = 'PAID') AS has_paid,
                     m.created_at, m.updated_at
                FROM members m JOIN users u ON u.id = m.user_id`;

const shape = (r) => ({ ...r, member_code: memberCode(r.id), is_active: Boolean(r.is_active), has_paid: Boolean(r.has_paid) });

exports.list = async () => (await pool.query(`${BASE} ORDER BY m.id DESC`))[0].map(shape);

exports.findById = async (id) => {
  const r = (await pool.query(`${BASE} WHERE m.id = ?`, [id]))[0][0];
  return r ? shape(r) : null;
};

// Data kartu member: membership terbaru yang sudah dibayar lunas. null jika belum ada pembayaran lunas.
exports.card = async (memberId) => {
  const [[row]] = await pool.query(
    `SELECT m.id AS member_id, u.name, m.created_at AS member_since,
            p.name AS package_name, ms.start_date, ms.end_date, ms.status
       FROM members m
       JOIN users u ON u.id = m.user_id
       JOIN memberships ms ON ms.member_id = m.id
       JOIN gym_packages p ON p.id = ms.package_id
      WHERE m.id = ?
        AND EXISTS (SELECT 1 FROM payments pay WHERE pay.membership_id = ms.id AND pay.status = 'PAID')
      ORDER BY ms.end_date DESC, ms.id DESC
      LIMIT 1`,
    [memberId]
  );
  return row ? { ...row, member_code: memberCode(row.member_id) } : null;
};

// Membuat baris users (role member) + members dalam satu transaksi.
exports.create = ({ name, email, passwordHash, phone, address }) =>
  withTransaction(async (conn) => {
    const userId = await userModel.create(conn, { name, email, password: passwordHash });
    const [r] = await conn.query('INSERT INTO members (user_id, phone, address) VALUES (?, ?, ?)', [userId, phone, address]);
    return r.insertId;
  });

// userData → tabel users, memberData → tabel members. Return false jika member tidak ada.
exports.update = (id, userData, memberData) =>
  withTransaction(async (conn) => {
    const [rows] = await conn.query('SELECT user_id FROM members WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) return false;
    await updateById(conn, 'users', rows[0].user_id, userData);
    await updateById(conn, 'members', id, memberData);
    return true;
  });

// Menghapus member yang TIDAK AKTIF (tanpa membership ACTIVE) beserta seluruh riwayatnya, dalam satu transaksi:
// pembayaran → membership → user (baris members ikut terhapus lewat ON DELETE CASCADE).
// Return: 'deleted' | 'not_found' | 'active'.
exports.remove = (id) =>
  withTransaction(async (conn) => {
    const [rows] = await conn.query('SELECT user_id FROM members WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) return 'not_found';

    const [ms] = await conn.query('SELECT status FROM memberships WHERE member_id = ? FOR UPDATE', [id]);
    if (ms.some((r) => r.status === 'ACTIVE')) return 'active';

    await conn.query('DELETE pay FROM payments pay JOIN memberships ms ON ms.id = pay.membership_id WHERE ms.member_id = ?', [id]);
    await conn.query('DELETE FROM memberships WHERE member_id = ?', [id]);
    await conn.query('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    return 'deleted';
  });

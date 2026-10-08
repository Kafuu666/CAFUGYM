const { pool } = require('../config/database');
const { updateById } = require('../utils/sql');

const BASE = `SELECT pay.id, pay.membership_id, ms.member_id, u.name AS member_name, p.name AS package_name,
                     pay.amount, pay.payment_date, pay.status, pay.method, pay.created_at, pay.updated_at
                FROM payments pay
                JOIN memberships ms ON ms.id = pay.membership_id
                JOIN members m ON m.id = ms.member_id
                JOIN users u ON u.id = m.user_id
                JOIN gym_packages p ON p.id = ms.package_id`;

exports.list = async (memberId = null) => {
  const [rows] = memberId
    ? await pool.query(`${BASE} WHERE ms.member_id = ? ORDER BY pay.id DESC`, [memberId])
    : await pool.query(`${BASE} ORDER BY pay.id DESC`);
  return rows;
};

exports.findById = async (id, db = pool) => (await db.query(`${BASE} WHERE pay.id = ?`, [id]))[0][0] || null;

exports.create = async (db, { membership_id, amount, payment_date, status = 'PENDING', method = null }) => {
  const [r] = await db.query('INSERT INTO payments (membership_id, amount, payment_date, status, method) VALUES (?, ?, ?, ?, ?)', [membership_id, amount, payment_date, status, method]);
  return r.insertId;
};

exports.update = (db, id, data) => updateById(db, 'payments', id, data);

exports.remove = async (id) => (await pool.query('DELETE FROM payments WHERE id = ?', [id]))[0].affectedRows;

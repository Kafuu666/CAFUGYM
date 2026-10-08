const { pool } = require('../config/database');

exports.findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

exports.create = async (db, { name, email, password, role = 'member' }) => {
  const [r] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
  return r.insertId;
};

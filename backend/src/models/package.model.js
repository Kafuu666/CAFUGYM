const { pool } = require('../config/database');
const { updateById } = require('../utils/sql');

exports.list = async () => (await pool.query('SELECT * FROM gym_packages ORDER BY duration, id'))[0];
exports.findById = async (id) => (await pool.query('SELECT * FROM gym_packages WHERE id = ?', [id]))[0][0] || null;

exports.create = async ({ name, duration, price, description = null }) => {
  const [r] = await pool.query('INSERT INTO gym_packages (name, duration, price, description) VALUES (?, ?, ?, ?)', [name, duration, price, description]);
  return r.insertId;
};

exports.update = (id, data) => updateById(pool, 'gym_packages', id, data);

exports.remove = async (id) => (await pool.query('DELETE FROM gym_packages WHERE id = ?', [id]))[0].affectedRows;

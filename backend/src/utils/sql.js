const { pool } = require('../config/database');

// UPDATE <table> SET <data> WHERE id = ?  (data harus sudah lolos whitelist/validasi)
async function updateById(db, table, id, data) {
  if (!Object.keys(data).length) return 0;
  const [r] = await db.query('UPDATE ?? SET ? WHERE id = ?', [table, data, id]);
  return r.affectedRows;
}

// Tanggal hari ini menurut server database, format 'YYYY-MM-DD'.
async function today() {
  const [[row]] = await pool.query('SELECT CURDATE() AS d');
  return row.d;
}

module.exports = { updateById, today };

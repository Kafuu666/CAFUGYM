const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  ...env.db,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,     // DATE/TIMESTAMP dikembalikan sebagai string 'YYYY-MM-DD ...'
  decimalNumbers: true,  // DECIMAL dikembalikan sebagai number, bukan string
});

// Menjalankan callback di dalam satu transaksi (commit jika sukses, rollback jika error).
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, withTransaction };

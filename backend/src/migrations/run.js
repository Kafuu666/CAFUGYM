// Menjalankan migration sesuai urutan dependency FK: users → members → gym_packages → memberships → payments.
// Pakai: npm run migrate  |  npm run migrate:fresh (hapus semua tabel lalu buat ulang)
const mysql = require('mysql2/promise');
const env = require('../config/env');

const migrations = ['users', 'members', 'gym_packages', 'memberships', 'payments'].map((n) => require(`./${n}`));

(async () => {
  const { database, ...conn } = env.db;
  const db = await mysql.createConnection(conn);
  try {
    await db.query(`CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await db.query(`USE ${mysql.escapeId(database)}`);

    if (process.argv.includes('--fresh')) {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const m of [...migrations].reverse()) {
        await db.query('DROP TABLE IF EXISTS ??', [m.table]);
        console.log(`- drop   ${m.table}`);
      }
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    for (const m of migrations) {
      await m.up(db);
      console.log(`+ create ${m.table}`);
    }
    console.log(`Migration selesai (database: ${database}).`);
  } catch (err) {
    console.error('Migration gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();

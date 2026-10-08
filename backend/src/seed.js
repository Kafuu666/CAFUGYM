// Data awal: 1 admin, 3 member, 4 paket gym, contoh membership & pembayaran. Aman dijalankan ulang (dilewati jika sudah ada data).
const bcrypt = require('bcryptjs');
const { pool, withTransaction } = require('./config/database');

(async () => {
  try {
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM users');
    if (n > 0) return console.log('Seed dilewati: tabel users sudah berisi data. Jalankan "npm run migrate:fresh" dulu untuk mulai dari awal.');

    await withTransaction(async (c) => {
      const hash = (p) => bcrypt.hashSync(p, 10);
      await c.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', ['Admin CAFU', 'admin@cafu.com', hash('admin123'), 'admin']);
      const members = [['Cafu', 'cafu@gmail.com', '08123456789', 'Jakarta'], ['Rina Putri', 'rina@mail.com', '081298765432', 'Bandung'], ['Bagas Pratama', 'bagas@mail.com', '085711223344', 'Depok']];
      const memberIds = [];
      for (const [name, email, phone, address] of members) {
        const [u] = await c.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, hash('123456'), 'member']);
        const [m] = await c.query('INSERT INTO members (user_id, phone, address) VALUES (?,?,?)', [u.insertId, phone, address]);
        memberIds.push(m.insertId);
      }
      await c.query('INSERT INTO gym_packages (name, duration, price, description) VALUES ?', [[
        ['Basic', 1, 100000, 'Akses gym reguler, loker, dan area kardio.'],
        ['Standard', 3, 250000, 'Semua di Basic, ditambah kelas kelompok.'],
        ['Premium', 6, 450000, 'Semua di Standard, ditambah evaluasi tubuh berkala.'],
        ['Annual', 12, 800000, 'Akses penuh setahun dengan harga paling hemat.'],
      ]]);
      const rows = [
        [memberIds[0], 2, '-9 DAY', 3, 'ACTIVE', 250000, 'QRIS'],
        [memberIds[1], 1, '-40 DAY', 1, 'EXPIRED', 100000, 'CASH'],
        [memberIds[2], 3, '-2 DAY', 6, 'ACTIVE', 450000, 'QRIS'],
      ];
      for (const [member, pkg, offset, months, status, amount, method] of rows) {
        const [ms] = await c.query(
          `INSERT INTO memberships (member_id, package_id, start_date, end_date, status)
           VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL ${offset}), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL ${offset}), INTERVAL ? MONTH), ?)`,
          [member, pkg, months, status]);
        await c.query(`INSERT INTO payments (membership_id, amount, payment_date, status, method) VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL ${offset}), 'PAID', ?)`, [ms.insertId, amount, method]);
      }
    });
    console.log('Seed selesai.\n  admin  : admin@cafu.com / admin123\n  member : cafu@gmail.com / 123456');
  } catch (e) {
    console.error('Seed gagal:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

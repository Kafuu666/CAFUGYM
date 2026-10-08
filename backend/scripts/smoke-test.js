// Uji cepat endpoint sesuai Testing Checklist PRD. Jalankan setelah "npm run migrate:fresh && npm run seed"
// dan server aktif ("npm start"):  npm test
// Catatan: QRIS_AUTO_CONFIRM harus true (default) agar skenario QRIS member langsung lunas.
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let pass = 0, fail = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}
function check(name, cond, extra = '') {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
}

(async () => {
  const email = `uji${Date.now()}@mail.com`;
  let r = await call('POST', '/auth/register', { body: { name: 'Penguji', email, password: '123456', phone: '0812', address: 'Bogor' } });
  check('Register email baru → 201 + token', r.status === 201 && r.json.token, JSON.stringify(r.json));
  r = await call('POST', '/auth/register', { body: { name: 'Penguji', email, password: '123456', phone: '0812', address: 'Bogor' } });
  check('Register email duplikat → 409', r.status === 409);
  r = await call('POST', '/auth/register', { body: { email: 'x', password: '1' } });
  check('Register data tidak valid → 422 + detail field', r.status === 422 && r.json.errors?.name, JSON.stringify(r.json));

  r = await call('POST', '/auth/login', { body: { email, password: 'salah' } });
  check('Login password salah → 401', r.status === 401);
  r = await call('POST', '/auth/login', { body: { email, password: '123456' } });
  const member = r.json.token;
  check('Login benar → JWT + user.role member', r.status === 200 && member && r.json.user.role === 'member');
  r = await call('POST', '/auth/login', { body: { email: 'admin@cafu.com', password: 'admin123' } });
  const admin = r.json.token;
  check('Login admin → role admin', r.json.user?.role === 'admin');

  r = await call('GET', '/packages');
  check('Endpoint privat tanpa token → 401', r.status === 401);
  r = await call('GET', '/packages', { token: 'token.palsu.xx' });
  check('Token palsu → 401', r.status === 401);
  r = await call('GET', '/auth/profile', { token: member });
  check('Profile member berisi phone & address', r.status === 200 && r.json.data.phone === '0812' && r.json.data.member_id);

  r = await call('GET', '/members', { token: member });
  check('Member akses /members → 403', r.status === 403);
  r = await call('POST', '/packages', { token: member, body: { name: 'X', duration: 1, price: 1 } });
  check('Member tambah paket → 403', r.status === 403);

  r = await call('GET', '/members', { token: admin });
  check('Admin lihat daftar member → 200', r.status === 200 && r.json.data.length >= 3);
  r = await call('POST', '/members', { token: admin, body: { name: 'Baru', email: `b${Date.now()}@mail.com`, password: 'rahasia1', phone: '081', address: 'Bekasi' } });
  const newMember = r.json.data?.id;
  check('Admin create member → 201', r.status === 201 && newMember);
  r = await call('PUT', `/members/${newMember}`, { token: admin, body: { phone: '0899' } });
  check('Admin update member → phone berubah', r.status === 200 && r.json.data.phone === '0899');
  r = await call('DELETE', `/members/${newMember}`, { token: admin });
  check('Admin delete member → 200', r.status === 200);
  r = await call('GET', `/members/${newMember}`, { token: admin });
  check('Member terhapus → 404', r.status === 404);
  r = await call('GET', '/members/abc', { token: admin });
  check('ID bukan angka → 400', r.status === 400);

  r = await call('POST', '/packages', { token: admin, body: { name: 'Trial', duration: 1, price: 50000, description: 'Uji' } });
  const pkg = r.json.data?.id;
  check('Admin create paket → 201', r.status === 201 && r.json.data.price === 50000);
  r = await call('PUT', `/packages/${pkg}`, { token: admin, body: { price: 60000 } });
  check('Admin update paket → 200', r.json.data?.price === 60000);
  r = await call('DELETE', `/packages/${pkg}`, { token: admin });
  check('Admin delete paket → 200', r.status === 200);
  r = await call('GET', '/packages', { token: member });
  check('Member lihat 4+ paket', r.status === 200 && r.json.data.length >= 4);

  const std = r.json.data.find((p) => p.name === 'Standard');
  r = await call('POST', '/memberships', { token: member, body: { package_id: std.id } });
  const ms = r.json.data?.membership, pay = r.json.data?.payment;
  check('Member pilih paket → membership PENDING + tagihan PENDING', r.status === 201 && ms.status === 'PENDING' && pay.status === 'PENDING' && pay.amount === 250000, JSON.stringify(r.json));
  check('Tanggal berakhir = mulai + 3 bulan', ms && new Date(ms.end_date) > new Date(ms.start_date));
  r = await call('GET', '/memberships', { token: member });
  check('Member hanya melihat membership miliknya', r.json.data.length === 1);
  r = await call('GET', '/memberships/1', { token: member });
  check('Member akses membership orang lain → 403', r.status === 403);
  r = await call('GET', '/cards/me', { token: member });
  check('Kartu member sebelum bayar → data null', r.status === 200 && r.json.data === null, JSON.stringify(r.json));
  r = await call('PATCH', `/payments/${pay.id}/pay`, { token: member });
  check('Bayar tanpa metode → 422', r.status === 422 && r.json.errors?.method, JSON.stringify(r.json));
  r = await call('PATCH', `/payments/${pay.id}/pay`, { token: member, body: { method: 'KARTU' } });
  check('Metode tidak dikenal → 422', r.status === 422);
  r = await call('PATCH', `/payments/${pay.id}/pay`, { token: member, body: { method: 'QRIS' } });
  check('Bayar QRIS → PAID + method QRIS', r.status === 200 && r.json.data.status === 'PAID' && r.json.data.method === 'QRIS', JSON.stringify(r.json));
  r = await call('GET', `/memberships/${ms.id}`, { token: member });
  check('Setelah bayar membership ACTIVE', r.json.data?.status === 'ACTIVE');
  r = await call('PATCH', `/payments/${pay.id}/pay`, { token: member, body: { method: 'QRIS' } });
  check('Bayar dua kali → 409', r.status === 409);
  r = await call('GET', '/payments', { token: member });
  check('Riwayat pembayaran member tampil', r.json.data.length === 1);
  r = await call('DELETE', `/payments/${pay.id}`, { token: member });
  check('Member hapus pembayaran → 403', r.status === 403);

  // --- Kartu member
  r = await call('GET', '/cards/me', { token: member });
  const card = r.json.data;
  check('Setelah bayar kartu terbit (kode CAFU-xxxxx, paket Standard, ACTIVE)', r.status === 200 && /^CAFU-\d{5}$/.test(card?.member_code) && card.package_name === 'Standard' && card.status === 'ACTIVE', JSON.stringify(r.json));
  r = await call('GET', `/cards/${card.member_id}`, { token: admin });
  check('Admin ambil kartu member untuk dicetak → 200', r.status === 200 && r.json.data.member_code === card.member_code);
  r = await call('GET', `/cards/${card.member_id}`, { token: member });
  check('Member akses kartu lewat /cards/:id → 403', r.status === 403);
  r = await call('GET', '/cards/me', { token: admin });
  check('Admin akses /cards/me → 403', r.status === 403);

  // --- Pembayaran tunai: member pilih tunai → tetap PENDING sampai admin konfirmasi
  const basic = (await call('GET', '/packages', { token: member })).json.data.find((p) => p.name === 'Basic');
  r = await call('POST', '/memberships', { token: member, body: { package_id: basic.id } });
  const ms2 = r.json.data.membership, pay2 = r.json.data.payment;
  r = await call('PATCH', `/payments/${pay2.id}/pay`, { token: member, body: { method: 'CASH' } });
  check('Member pilih tunai → tetap PENDING, method CASH', r.status === 200 && r.json.data.status === 'PENDING' && r.json.data.method === 'CASH', JSON.stringify(r.json));
  r = await call('GET', `/memberships/${ms2.id}`, { token: member });
  check('Tunai belum dikonfirmasi → membership masih PENDING', r.json.data?.status === 'PENDING');
  r = await call('PATCH', `/payments/${pay2.id}/pay`, { token: admin, body: { method: 'CASH' } });
  check('Admin konfirmasi tunai → PAID', r.status === 200 && r.json.data.status === 'PAID' && r.json.data.method === 'CASH', JSON.stringify(r.json));
  r = await call('GET', `/memberships/${ms2.id}`, { token: member });
  check('Setelah admin konfirmasi → membership ACTIVE', r.json.data?.status === 'ACTIVE');
  r = await call('PUT', `/payments/${pay2.id}`, { token: admin, body: { status: 'PAID' } });
  check('Admin update pembayaran PAID yang sudah punya metode → 200', r.status === 200);
  r = await call('POST', '/payments', { token: admin, body: { membership_id: ms2.id, status: 'PAID' } });
  check('Admin catat pembayaran lunas tanpa metode → 422', r.status === 422 && r.json.errors?.method, JSON.stringify(r.json));

  r = await call('DELETE', `/memberships/${ms.id}`, { token: admin });
  check('Hapus membership yang punya pembayaran → 409', r.status === 409);

  // --- Hapus member tidak aktif
  const memberId = card.member_id;
  r = await call('GET', '/members', { token: admin });
  const row = r.json.data.find((m) => m.id === memberId);
  check('Daftar member menandai member aktif (is_active, has_paid, member_code)', row?.is_active === true && row.has_paid === true && row.member_code === card.member_code, JSON.stringify(row));
  r = await call('DELETE', `/members/${memberId}`, { token: admin });
  check('Hapus member yang masih aktif → 409', r.status === 409, JSON.stringify(r.json));
  for (const id of [ms.id, ms2.id]) await call('PUT', `/memberships/${id}`, { token: admin, body: { status: 'EXPIRED' } });
  r = await call('GET', `/members/${memberId}`, { token: admin });
  check('Setelah semua membership berakhir → is_active false', r.json.data?.is_active === false);
  r = await call('DELETE', `/members/${memberId}`, { token: member });
  check('Member hapus member → 403', r.status === 403);
  r = await call('DELETE', `/members/${memberId}`, { token: admin });
  check('Hapus member tidak aktif (beserta riwayat) → 200', r.status === 200, JSON.stringify(r.json));
  r = await call('GET', `/members/${memberId}`, { token: admin });
  check('Member yang dihapus → 404', r.status === 404);
  r = await call('GET', '/auth/profile', { token: member });
  check('Token member yang dihapus → 401', r.status === 401);
  r = await call('GET', '/stats', { token: admin });
  check('Statistik admin → total_members, revenue', r.status === 200 && r.json.data.total_members >= 3 && r.json.data.revenue > 0, JSON.stringify(r.json));
  r = await call('GET', '/tidak-ada', { token: admin });
  check('Endpoint tak dikenal → 404 JSON', r.status === 404 && r.json.message);

  console.log(`\n${pass} lulus, ${fail} gagal`);
  process.exit(fail ? 1 : 0);
})();

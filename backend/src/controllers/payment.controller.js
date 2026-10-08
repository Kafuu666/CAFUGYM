const env = require('../config/env');
const { pool, withTransaction } = require('../config/database');
const { ApiError, asyncHandler } = require('../utils/http');
const { parse } = require('../utils/validate');
const { today } = require('../utils/sql');
const membershipModel = require('../models/membership.model');
const paymentModel = require('../models/payment.model');

const STATUSES = ['PAID', 'PENDING', 'CANCELLED'];
const METHODS = ['QRIS', 'CASH'];
const isAdmin = (req) => req.user.role === 'admin';
const assertOwner = (req, row) => {
  if (!isAdmin(req) && row.member_id !== req.user.member_id) throw new ApiError(403, 'Anda tidak berhak mengakses data ini.');
};

exports.list = asyncHandler(async (req, res) => {
  res.json({ data: await paymentModel.list(isAdmin(req) ? null : req.user.member_id) });
});

exports.get = asyncHandler(async (req, res) => {
  const row = await paymentModel.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Pembayaran tidak ditemukan.');
  assertOwner(req, row);
  res.json({ data: row });
});

// Member: membuat tagihan PENDING untuk membership miliknya (nominal = harga paket).
// Admin: mencatat pembayaran dengan nominal, tanggal, dan status sendiri.
exports.create = asyncHandler(async (req, res) => {
  const d = parse(req.body, {
    membership_id: { type: 'int', required: true },
    amount: { type: 'number', min: 0 },
    payment_date: { type: 'date' },
    status: { type: 'enum', values: STATUSES },
    method: { type: 'enum', values: METHODS },
  });
  const ms = await membershipModel.findById(d.membership_id);
  if (!ms) throw new ApiError(422, 'Validasi gagal.', { membership_id: 'membership tidak ditemukan' });
  assertOwner(req, ms);

  const data = isAdmin(req)
    ? { membership_id: ms.id, amount: d.amount ?? ms.price, payment_date: d.payment_date || (await today()), status: d.status || 'PENDING', method: d.method || null }
    : { membership_id: ms.id, amount: ms.price, payment_date: await today(), status: 'PENDING', method: null };
  if (data.status === 'PAID' && !data.method) throw new ApiError(422, 'Validasi gagal.', { method: 'wajib diisi jika status Lunas (QRIS/CASH)' });

  const id = await withTransaction(async (conn) => {
    const newId = await paymentModel.create(conn, data);
    if (data.status === 'PAID') await membershipModel.activate(conn, ms.id);
    return newId;
  });
  res.status(201).json({ message: 'Pembayaran ditambahkan.', data: await paymentModel.findById(id) });
});

exports.update = asyncHandler(async (req, res) => {
  const d = parse(req.body, {
    membership_id: { type: 'int' },
    amount: { type: 'number', min: 0 },
    payment_date: { type: 'date' },
    status: { type: 'enum', values: STATUSES },
    method: { type: 'enum', values: METHODS },
  }, { partial: true });

  const current = await paymentModel.findById(req.params.id);
  if (!current) throw new ApiError(404, 'Pembayaran tidak ditemukan.');
  if (d.status === 'PAID' && current.status !== 'PAID' && !(d.method || current.method)) {
    throw new ApiError(422, 'Validasi gagal.', { method: 'wajib diisi jika status Lunas (QRIS/CASH)' });
  }

  await withTransaction(async (conn) => {
    await paymentModel.update(conn, current.id, d);
    if ((d.status || current.status) === 'PAID') await membershipModel.activate(conn, d.membership_id || current.membership_id);
  });
  res.json({ message: 'Pembayaran diperbarui.', data: await paymentModel.findById(current.id) });
});

// Tambahan di luar PRD: tombol "Bayar" dengan pilihan metode { method: 'QRIS' | 'CASH' }.
//  - Admin          : selalu melunasi (menerima tunai di kasir / memastikan dana QRIS masuk).
//  - Member + QRIS  : langsung lunas (simulasi tanpa payment gateway, QRIS_AUTO_CONFIRM=true)
//                     atau menunggu konfirmasi admin (QRIS_AUTO_CONFIRM=false).
//  - Member + CASH  : metode dicatat, status tetap PENDING sampai admin menerima uang di kasir.
// Saat lunas, membership PENDING menjadi ACTIVE sehingga kartu member terbit.
exports.pay = asyncHandler(async (req, res) => {
  const { method } = parse(req.body, { method: { type: 'enum', required: true, values: METHODS } });
  const p = await paymentModel.findById(req.params.id);
  if (!p) throw new ApiError(404, 'Pembayaran tidak ditemukan.');
  assertOwner(req, p);
  if (p.status === 'PAID') throw new ApiError(409, 'Pembayaran sudah lunas.');
  if (p.status === 'CANCELLED') throw new ApiError(409, 'Pembayaran sudah dibatalkan.');

  const settled = isAdmin(req) || (method === 'QRIS' && env.payment.qrisAutoConfirm);
  if (!settled) {
    await paymentModel.update(pool, p.id, { method });
    const message = method === 'CASH'
      ? 'Metode tunai dipilih. Bayar di kasir; membership aktif setelah admin mengonfirmasi.'
      : 'Pembayaran QRIS dicatat. Membership aktif setelah admin mengonfirmasi.';
    return res.json({ message, data: await paymentModel.findById(p.id) });
  }

  const date = await today();
  await withTransaction(async (conn) => {
    await paymentModel.update(conn, p.id, { status: 'PAID', method, payment_date: date });
    await membershipModel.activate(conn, p.membership_id);
  });
  res.json({ message: 'Pembayaran lunas. Membership aktif dan kartu member sudah terbit.', data: await paymentModel.findById(p.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  if (!(await paymentModel.remove(req.params.id))) throw new ApiError(404, 'Pembayaran tidak ditemukan.');
  res.json({ message: 'Pembayaran dihapus.' });
});

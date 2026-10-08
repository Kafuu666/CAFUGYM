const { pool, withTransaction } = require('../config/database');
const { ApiError, asyncHandler } = require('../utils/http');
const { parse } = require('../utils/validate');
const memberModel = require('../models/member.model');
const packageModel = require('../models/package.model');
const membershipModel = require('../models/membership.model');
const paymentModel = require('../models/payment.model');

const STATUSES = ['ACTIVE', 'EXPIRED', 'PENDING'];
const isAdmin = (req) => req.user.role === 'admin';
const assertOwner = (req, row) => {
  if (!isAdmin(req) && row.member_id !== req.user.member_id) throw new ApiError(403, 'Anda tidak berhak mengakses data ini.');
};

exports.list = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  res.json({ data: await membershipModel.list(isAdmin(req) ? null : req.user.member_id) });
});

exports.get = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  const row = await membershipModel.findById(req.params.id);
  if (!row) throw new ApiError(404, 'Membership tidak ditemukan.');
  assertOwner(req, row);
  res.json({ data: row });
});

// Member: memilih paket → membership PENDING + tagihan PENDING (dibuat dalam satu transaksi).
// Admin: membuat membership untuk member mana pun dengan tanggal/status sendiri.
exports.create = asyncHandler(async (req, res) => {
  if (!isAdmin(req)) {
    const { package_id } = parse(req.body, { package_id: { type: 'int', required: true } });
    const pkg = await packageModel.findById(package_id);
    if (!pkg) throw new ApiError(404, 'Paket tidak ditemukan.');
    const range = await membershipModel.range(null, pkg.duration);

    const { membershipId, paymentId } = await withTransaction(async (conn) => {
      const membershipId = await membershipModel.create(conn, { member_id: req.user.member_id, package_id, ...range });
      const paymentId = await paymentModel.create(conn, { membership_id: membershipId, amount: pkg.price, payment_date: range.start_date });
      return { membershipId, paymentId };
    });
    return res.status(201).json({
      message: 'Paket dipilih. Selesaikan pembayaran untuk mengaktifkan membership.',
      data: { membership: await membershipModel.findById(membershipId), payment: await paymentModel.findById(paymentId) },
    });
  }

  const d = parse(req.body, {
    member_id: { type: 'int', required: true },
    package_id: { type: 'int', required: true },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    status: { type: 'enum', values: STATUSES },
  });
  if (!(await memberModel.findById(d.member_id))) throw new ApiError(422, 'Validasi gagal.', { member_id: 'member tidak ditemukan' });
  const pkg = await packageModel.findById(d.package_id);
  if (!pkg) throw new ApiError(422, 'Validasi gagal.', { package_id: 'paket tidak ditemukan' });

  const range = await membershipModel.range(d.start_date, pkg.duration);
  const start_date = range.start_date;
  const end_date = d.end_date || range.end_date;
  if (end_date < start_date) throw new ApiError(422, 'Validasi gagal.', { end_date: 'tidak boleh sebelum start_date' });

  const id = await membershipModel.create(pool, { ...d, start_date, end_date });
  res.status(201).json({ message: 'Membership ditambahkan.', data: await membershipModel.findById(id) });
});

exports.update = asyncHandler(async (req, res) => {
  const d = parse(req.body, {
    member_id: { type: 'int' },
    package_id: { type: 'int' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    status: { type: 'enum', values: STATUSES },
  }, { partial: true });

  const current = await membershipModel.findById(req.params.id);
  if (!current) throw new ApiError(404, 'Membership tidak ditemukan.');
  if ((d.end_date || current.end_date) < (d.start_date || current.start_date)) {
    throw new ApiError(422, 'Validasi gagal.', { end_date: 'tidak boleh sebelum start_date' });
  }
  await membershipModel.update(req.params.id, d);
  res.json({ message: 'Membership diperbarui.', data: await membershipModel.findById(req.params.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  if (!(await membershipModel.remove(req.params.id))) throw new ApiError(404, 'Membership tidak ditemukan.');
  res.json({ message: 'Membership dihapus.' });
});

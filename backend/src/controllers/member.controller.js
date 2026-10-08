const bcrypt = require('bcryptjs');
const { ApiError, asyncHandler } = require('../utils/http');
const { parse } = require('../utils/validate');
const userModel = require('../models/user.model');
const memberModel = require('../models/member.model');
const membershipModel = require('../models/membership.model');

const rules = {
  name: { type: 'string', required: true, max: 100 },
  email: { type: 'email', required: true },
  password: { type: 'password', required: true },
  phone: { type: 'string', required: true, max: 30 },
  address: { type: 'string', required: true },
};

exports.list = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated(); // status aktif/tidak aktif harus akurat
  res.json({ data: await memberModel.list() });
});

exports.get = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  const m = await memberModel.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Member tidak ditemukan.');
  res.json({ data: m });
});

exports.create = asyncHandler(async (req, res) => {
  const d = parse(req.body, rules);
  if (await userModel.findByEmail(d.email)) throw new ApiError(409, 'Email sudah terdaftar.');
  const id = await memberModel.create({ ...d, passwordHash: await bcrypt.hash(d.password, 10) });
  res.status(201).json({ message: 'Member ditambahkan.', data: await memberModel.findById(id) });
});

exports.update = asyncHandler(async (req, res) => {
  const d = parse(req.body, rules, { partial: true });
  const userData = {};
  if (d.name) userData.name = d.name;
  if (d.email) userData.email = d.email;
  if (d.password) userData.password = await bcrypt.hash(d.password, 10);
  const memberData = {};
  if (d.phone) memberData.phone = d.phone;
  if (d.address) memberData.address = d.address;

  if (!(await memberModel.update(req.params.id, userData, memberData))) throw new ApiError(404, 'Member tidak ditemukan.');
  res.json({ message: 'Member diperbarui.', data: await memberModel.findById(req.params.id) });
});

// Hanya member tidak aktif yang boleh dihapus; riwayat membership & pembayarannya ikut terhapus.
exports.remove = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  const result = await memberModel.remove(req.params.id);
  if (result === 'not_found') throw new ApiError(404, 'Member tidak ditemukan.');
  if (result === 'active') throw new ApiError(409, 'Member masih aktif (memiliki membership aktif) sehingga tidak dapat dihapus.');
  res.json({ message: 'Member tidak aktif dihapus beserta riwayat membership dan pembayarannya.' });
});

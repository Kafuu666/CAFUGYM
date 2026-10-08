const bcrypt = require('bcryptjs');
const { ApiError, asyncHandler } = require('../utils/http');
const { parse } = require('../utils/validate');
const { signToken } = require('../utils/token');
const userModel = require('../models/user.model');
const memberModel = require('../models/member.model');

// Hash pembanding agar waktu respons login tidak membedakan email terdaftar / tidak.
const DUMMY_HASH = bcrypt.hashSync('cafu-gym-dummy', 10);

exports.register = asyncHandler(async (req, res) => {
  const d = parse(req.body, {
    name: { type: 'string', required: true, max: 100 },
    email: { type: 'email', required: true },
    password: { type: 'password', required: true },
    phone: { type: 'string', required: true, max: 30 },
    address: { type: 'string', required: true },
  });
  if (await userModel.findByEmail(d.email)) throw new ApiError(409, 'Email sudah terdaftar.');

  const memberId = await memberModel.create({ ...d, passwordHash: await bcrypt.hash(d.password, 10) });
  const m = await memberModel.findById(memberId);
  const user = { id: m.user_id, name: m.name, email: m.email, role: 'member' };
  res.status(201).json({ message: 'Registrasi berhasil.', token: signToken(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const d = parse(req.body, { email: { type: 'email', required: true }, password: { type: 'raw', required: true } });
  const u = await userModel.findByEmail(d.email);
  const ok = await bcrypt.compare(d.password, u ? u.password : DUMMY_HASH);
  if (!u || !ok) throw new ApiError(401, 'Email atau password salah.');

  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  res.json({ token: signToken(user), user });
});

exports.profile = asyncHandler(async (req, res) => {
  const { id, name, email, role, member_id } = req.user;
  const m = member_id ? await memberModel.findById(member_id) : null;
  res.json({ data: { id, name, email, role, member_id, phone: m?.phone ?? null, address: m?.address ?? null } });
});

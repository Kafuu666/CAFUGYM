const { ApiError, asyncHandler } = require('../utils/http');
const memberModel = require('../models/member.model');
const membershipModel = require('../models/membership.model');

// Kartu member milik sendiri. `data` = null jika belum ada pembayaran lunas (kartu belum terbit).
exports.mine = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  res.json({ data: await memberModel.card(req.user.member_id) });
});

// Admin: kartu member mana pun (untuk dicetak). 404 jika member tidak ada / belum ada pembayaran lunas.
exports.get = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  if (!(await memberModel.findById(req.params.id))) throw new ApiError(404, 'Member tidak ditemukan.');
  const card = await memberModel.card(req.params.id);
  if (!card) throw new ApiError(404, 'Kartu belum tersedia: member belum memiliki pembayaran lunas.');
  res.json({ data: card });
});

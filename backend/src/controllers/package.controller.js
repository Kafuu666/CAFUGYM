const { ApiError, asyncHandler } = require('../utils/http');
const { parse } = require('../utils/validate');
const packageModel = require('../models/package.model');

const rules = {
  name: { type: 'string', required: true, max: 100 },
  duration: { type: 'int', required: true, min: 1 },
  price: { type: 'number', required: true, min: 0 },
  description: { type: 'string' },
};

exports.list = asyncHandler(async (req, res) => res.json({ data: await packageModel.list() }));

exports.get = asyncHandler(async (req, res) => {
  const p = await packageModel.findById(req.params.id);
  if (!p) throw new ApiError(404, 'Paket tidak ditemukan.');
  res.json({ data: p });
});

exports.create = asyncHandler(async (req, res) => {
  const id = await packageModel.create(parse(req.body, rules));
  res.status(201).json({ message: 'Paket ditambahkan.', data: await packageModel.findById(id) });
});

exports.update = asyncHandler(async (req, res) => {
  const d = parse(req.body, rules, { partial: true });
  if (!(await packageModel.update(req.params.id, d))) throw new ApiError(404, 'Paket tidak ditemukan.');
  res.json({ message: 'Paket diperbarui.', data: await packageModel.findById(req.params.id) });
});

exports.remove = asyncHandler(async (req, res) => {
  if (!(await packageModel.remove(req.params.id))) throw new ApiError(404, 'Paket tidak ditemukan.');
  res.json({ message: 'Paket dihapus.' });
});

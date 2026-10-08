const { ApiError } = require('../utils/http');

// Pakai setelah auth.middleware. Role tidak sesuai → HTTP 403.
module.exports = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(new ApiError(403, 'Anda tidak memiliki akses ke sumber daya ini.'));

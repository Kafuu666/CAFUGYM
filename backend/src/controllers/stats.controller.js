const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/http');
const membershipModel = require('../models/membership.model');

// Tambahan di luar PRD: data kartu statistik Dashboard Admin.
exports.get = asyncHandler(async (req, res) => {
  await membershipModel.expireOutdated();
  const [[row]] = await pool.query(`
    SELECT (SELECT COUNT(*) FROM members) AS total_members,
           (SELECT COUNT(*) FROM memberships WHERE status = 'ACTIVE') AS active_memberships,
           (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAID') AS revenue,
           (SELECT COUNT(*) FROM payments WHERE status = 'PENDING') AS pending_payments`);
  res.json({ data: row });
});

const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const c = require('../controllers/stats.controller');

router.get('/', auth, authorize('admin'), c.get);

module.exports = router;

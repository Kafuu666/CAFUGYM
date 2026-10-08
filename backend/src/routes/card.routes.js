const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { validateIdParam } = require('../utils/http');
const c = require('../controllers/card.controller');

router.param('id', validateIdParam);

router.get('/me', auth, authorize('member'), c.mine); // harus sebelum '/:id'
router.get('/:id', auth, authorize('admin'), c.get);

module.exports = router;

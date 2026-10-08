const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { validateIdParam } = require('../utils/http');
const c = require('../controllers/payment.controller');

router.param('id', validateIdParam);

router.get('/', auth, c.list);
router.get('/:id', auth, c.get);
router.post('/', auth, c.create);
router.patch('/:id/pay', auth, c.pay);
router.put('/:id', auth, authorize('admin'), c.update);
router.delete('/:id', auth, authorize('admin'), c.remove);

module.exports = router;

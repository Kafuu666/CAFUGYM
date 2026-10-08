const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const { validateIdParam } = require('../utils/http');
const c = require('../controllers/member.controller');

router.param('id', validateIdParam);
router.use(auth, authorize('admin'));

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

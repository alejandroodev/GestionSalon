const router = require('express').Router();
const c = require('./cliente.controller');
const { requireLogin, requireAdmin } = require('../../middleware/auth');

router.get('/', requireAdmin, c.listar);
router.get('/me', requireLogin, c.perfil);
router.post('/me', requireLogin, c.actualizar);
router.get('/:id', requireAdmin, c.historialAdmin);

module.exports = router;

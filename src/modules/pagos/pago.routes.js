const router = require('express').Router();
const c = require('./pago.controller');
const { requireLogin } = require('../../middleware/auth');

router.get('/', requireLogin, c.listar);
router.get('/reserva/:reservaId/nuevo', requireLogin, c.nuevoForm);
router.post('/reserva/:reservaId', requireLogin, c.crear);

module.exports = router;

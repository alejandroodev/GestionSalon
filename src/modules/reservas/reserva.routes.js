const router = require('express').Router();
const c = require('./reserva.controller');
const { requireLogin } = require('../../middleware/auth');

router.get('/', requireLogin, c.listar);
router.get('/nueva', requireLogin, c.nuevoForm);
router.post('/', requireLogin, c.crear);
router.get('/:id/editar', requireLogin, c.editarForm);
router.post('/:id', requireLogin, c.actualizar);
router.post('/:id/cancelar', requireLogin, c.cancelar);

module.exports = router;

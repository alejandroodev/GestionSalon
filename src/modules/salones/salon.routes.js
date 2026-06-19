const router = require('express').Router();
const c = require('./salon.controller');
const { requireLogin, requireAdmin } = require('../../middleware/auth');

router.get('/', requireLogin, c.listar);
router.get('/nuevo', requireAdmin, c.nuevoForm);
router.post('/', requireAdmin, c.crear);
router.get('/:id/editar', requireAdmin, c.editarForm);
router.post('/:id', requireAdmin, c.actualizar);
router.post('/:id/eliminar', requireAdmin, c.eliminar);
router.get('/:id/disponibilidad', requireLogin, c.disponibilidad);

module.exports = router;

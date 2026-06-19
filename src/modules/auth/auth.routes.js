const router = require('express').Router();
const c = require('./auth.controller');

router.get('/login', c.loginForm);
router.post('/login', c.login);
router.get('/registro', c.registroForm);
router.post('/registro', c.registro);
router.post('/logout', c.logout);

module.exports = router;

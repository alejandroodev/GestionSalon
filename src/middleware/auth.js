function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.rol !== 'admin') return res.status(403).render('error', { msg: 'Solo administradores' });
  next();
}
module.exports = { requireLogin, requireAdmin };

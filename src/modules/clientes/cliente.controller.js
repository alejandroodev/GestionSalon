const Cliente = require('./cliente.model');

exports.listar = (req, res) => res.render('clientes/list', { clientes: Cliente.all() });

exports.perfil = (req, res) => {
  if (req.session.user.rol === 'admin') return res.redirect('/clientes');
  const cliente = Cliente.byId(req.session.user.id);
  res.render('clientes/perfil', { cliente, historial: Cliente.historial(cliente.id) });
};

exports.actualizar = (req, res) => {
  Cliente.actualizar(req.session.user.id, req.body);
  req.session.user.nombre = req.body.nombre;
  req.session.flash = 'Perfil actualizado';
  res.redirect('/clientes/me');
};

exports.historialAdmin = (req, res) => {
  const cliente = Cliente.byId(req.params.id);
  if (!cliente) return res.status(404).render('error', { msg: 'Cliente no existe' });
  res.render('clientes/perfil', { cliente, historial: Cliente.historial(cliente.id), readonly: true });
};

const Salon = require('./salon.model');

exports.listar = (req, res) => {
  const esAdmin = req.session.user?.rol === 'admin';
  res.render('salones/list', { salones: esAdmin ? Salon.all() : Salon.activos() });
};

exports.nuevoForm = (req, res) => res.render('salones/form', { salon: {}, action: '/salones' });

exports.crear = (req, res) => {
  Salon.crear(req.body);
  req.session.flash = 'Salón creado';
  res.redirect('/salones');
};

exports.editarForm = (req, res) => {
  const salon = Salon.byId(req.params.id);
  if (!salon) return res.status(404).render('error', { msg: 'Salón no existe' });
  res.render('salones/form', { salon, action: `/salones/${salon.id}` });
};

exports.actualizar = (req, res) => {
  Salon.actualizar(req.params.id, { ...req.body, activo: req.body.activo === 'on' || req.body.activo === '1' });
  req.session.flash = 'Salón actualizado';
  res.redirect('/salones');
};

exports.eliminar = (req, res) => {
  Salon.eliminar(req.params.id);
  req.session.flash = 'Salón eliminado';
  res.redirect('/salones');
};

exports.disponibilidad = (req, res) => {
  const salon = Salon.byId(req.params.id);
  if (!salon) return res.status(404).render('error', { msg: 'Salón no existe' });
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
  res.render('salones/disponibilidad', { salon, fecha, ocupados: Salon.reservasDeFecha(salon.id, fecha) });
};

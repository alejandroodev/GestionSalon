const Reserva = require('./reserva.model');
const Salon = require('../salones/salon.model');
const Cliente = require('../clientes/cliente.model');

function validarHorario(fecha, hi, hf, salon) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return 'Fecha inválida';
  if (!/^\d{2}:\d{2}$/.test(hi) || !/^\d{2}:\d{2}$/.test(hf)) return 'Hora inválida';
  if (hi >= hf) return 'La hora de inicio debe ser menor que la de fin';
  if (!salon) return 'Salón no válido';
  if (hi < salon.hora_apertura || hf > salon.hora_cierre) {
    return `El salón solo está disponible de ${salon.hora_apertura} a ${salon.hora_cierre}`;
  }
  return null;
}

exports.listar = (req, res) => {
  const u = req.session.user;
  const reservas = u.rol === 'admin' ? Reserva.todas() : Reserva.delUsuario(u.id);
  res.render('reservas/list', { reservas });
};

exports.nuevoForm = (req, res) => {
  const esAdmin = req.session.user.rol === 'admin';
  res.render('reservas/form', {
    reserva: { salon_id: req.query.salon_id || '', fecha: '', hora_inicio: '', hora_fin: '' },
    salones: Salon.activos(),
    clientes: esAdmin ? Cliente.all() : null,
    action: '/reservas',
    error: null,
  });
};

exports.crear = (req, res) => {
  const esAdmin = req.session.user.rol === 'admin';
  const { salon_id, fecha, hora_inicio, hora_fin } = req.body;
  const render = (error) => res.status(400).render('reservas/form', {
    reserva: req.body, salones: Salon.activos(),
    clientes: esAdmin ? Cliente.all() : null, action: '/reservas', error,
  });

  let usuario_id = req.session.user.id;
  if (esAdmin) {
    usuario_id = req.body.usuario_id;
    if (!usuario_id || !Cliente.byId(usuario_id)) return render('Debes asignar la reserva a un cliente');
  }

  const err = validarHorario(fecha, hora_inicio, hora_fin, Salon.byId(salon_id));
  if (err) return render(err);
  if (Salon.hayChoque(salon_id, fecha, hora_inicio, hora_fin)) return render('El salón no está disponible en ese horario');
  Reserva.crear({ usuario_id, salon_id, fecha, hora_inicio, hora_fin });
  req.session.flash = 'Reserva creada';
  res.redirect('/reservas');
};

exports.editarForm = (req, res) => {
  const reserva = Reserva.byId(req.params.id);
  if (!reserva) return res.status(404).render('error', { msg: 'Reserva no existe' });
  if (req.session.user.rol !== 'admin' && reserva.usuario_id !== req.session.user.id) {
    return res.status(403).render('error', { msg: 'No autorizado' });
  }
  const esAdmin = req.session.user.rol === 'admin';
  res.render('reservas/form', {
    reserva, salones: Salon.activos(), clientes: esAdmin ? Cliente.all() : null,
    bloqueado: reserva.estado === 'activa', // ya pagada: no se cambian fecha/hora/salón
    action: `/reservas/${reserva.id}`, error: null,
  });
};

exports.actualizar = (req, res) => {
  const reserva = Reserva.byId(req.params.id);
  if (!reserva) return res.status(404).render('error', { msg: 'Reserva no existe' });
  const esAdmin = req.session.user.rol === 'admin';
  if (!esAdmin && reserva.usuario_id !== req.session.user.id) {
    return res.status(403).render('error', { msg: 'No autorizado' });
  }
  const bloqueado = reserva.estado === 'activa'; // ya pagada: fecha/hora/salón no se tocan
  const render = (error) => res.status(400).render('reservas/form', {
    reserva: { ...req.body, id: reserva.id, estado: reserva.estado }, salones: Salon.activos(),
    clientes: esAdmin ? Cliente.all() : null, bloqueado, action: `/reservas/${reserva.id}`, error,
  });

  let usuario_id = reserva.usuario_id;
  if (esAdmin) {
    usuario_id = req.body.usuario_id;
    if (!usuario_id || !Cliente.byId(usuario_id)) return render('Debes asignar la reserva a un cliente');
  }

  const estadosValidos = ['pendiente', 'activa', 'cancelada', 'finalizada'];
  let estado = reserva.estado;
  if (esAdmin && estadosValidos.includes(req.body.estado)) estado = req.body.estado;

  // Si está pagada, se conservan los valores guardados; si no, se toman del form y se validan.
  let { salon_id, fecha, hora_inicio, hora_fin } = bloqueado ? reserva : req.body;
  if (!bloqueado) {
    const err = validarHorario(fecha, hora_inicio, hora_fin, Salon.byId(salon_id));
    if (err) return render(err);
    if (Salon.hayChoque(salon_id, fecha, hora_inicio, hora_fin, reserva.id)) return render('El salón no está disponible en ese horario');
  }
  Reserva.actualizar(reserva.id, { usuario_id, salon_id, fecha, hora_inicio, hora_fin, estado });
  req.session.flash = 'Reserva actualizada';
  res.redirect('/reservas');
};

exports.cancelar = (req, res) => {
  const reserva = Reserva.byId(req.params.id);
  if (!reserva) return res.status(404).render('error', { msg: 'Reserva no existe' });
  if (req.session.user.rol !== 'admin' && reserva.usuario_id !== req.session.user.id) {
    return res.status(403).render('error', { msg: 'No autorizado' });
  }
  Reserva.cancelar(reserva.id);
  req.session.flash = 'Reserva cancelada';
  res.redirect('/reservas');
};

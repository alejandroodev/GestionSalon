const Pago = require('./pago.model');
const Reserva = require('../reservas/reserva.model');
const Salon = require('../salones/salon.model');

function calcularMonto(reserva) {
  const [hi, mi] = reserva.hora_inicio.split(':').map(Number);
  const [hf, mf] = reserva.hora_fin.split(':').map(Number);
  const horas = (hf + mf / 60) - (hi + mi / 60);
  return +(horas * reserva.precio_hora).toFixed(2);
}

exports.listar = (req, res) => {
  const u = req.session.user;
  res.render('pagos/list', { pagos: u.rol === 'admin' ? Pago.todos() : Pago.delUsuario(u.id) });
};

exports.nuevoForm = (req, res) => {
  const reserva = Reserva.byId(req.params.reservaId);
  if (!reserva) return res.status(404).render('error', { msg: 'Reserva no existe' });
  if (req.session.user.rol !== 'admin' && reserva.usuario_id !== req.session.user.id) {
    return res.status(403).render('error', { msg: 'No autorizado' });
  }
  res.render('pagos/form', { reserva, monto: calcularMonto(reserva) });
};

exports.crear = (req, res) => {
  const reserva = Reserva.byId(req.params.reservaId);
  if (!reserva) return res.status(404).render('error', { msg: 'Reserva no existe' });
  if (req.session.user.rol !== 'admin' && reserva.usuario_id !== req.session.user.id) {
    return res.status(403).render('error', { msg: 'No autorizado' });
  }
  if (reserva.estado !== 'pendiente') {
    req.session.flash = 'La reserva ya no está pendiente de pago';
    return res.redirect('/reservas');
  }

  if (Salon.hayChoque(reserva.salon_id, reserva.fecha, reserva.hora_inicio, reserva.hora_fin, reserva.id)) {
    req.session.flash = 'El salón ya no está disponible en ese horario, no se pudo pagar';
    return res.redirect('/reservas');
  }
  Pago.crear({ reserva_id: reserva.id, monto: calcularMonto(reserva), metodo: req.body.metodo });
  Reserva.activar(reserva.id);
  req.session.flash = 'Pago registrado, reserva activada';
  res.redirect('/pagos');
};

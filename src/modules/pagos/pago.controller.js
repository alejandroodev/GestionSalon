const Pago = require('./pago.model');
const Reserva = require('../reservas/reserva.model');

// Monto = horas reservadas × precio por hora del salón
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
  // El monto se calcula en el servidor; no se confía en lo que venga del form.
  Pago.crear({ reserva_id: reserva.id, monto: calcularMonto(reserva), metodo: req.body.metodo });
  req.session.flash = 'Pago registrado';
  res.redirect('/pagos');
};

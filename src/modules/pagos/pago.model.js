const { db } = require('../../db');

const Pago = {
  delUsuario: (usuarioId) => db.prepare(`
    SELECT p.*, r.fecha, r.hora_inicio, s.nombre AS salon_nombre
    FROM pagos p
    JOIN reservas r ON r.id = p.reserva_id
    JOIN salones s ON s.id = r.salon_id
    WHERE r.usuario_id = ? ORDER BY p.creado_en DESC`).all(usuarioId),

  todos: () => db.prepare(`
    SELECT p.*, r.fecha, s.nombre AS salon_nombre, u.nombre AS cliente_nombre
    FROM pagos p
    JOIN reservas r ON r.id = p.reserva_id
    JOIN salones s ON s.id = r.salon_id
    JOIN usuarios u ON u.id = r.usuario_id
    ORDER BY p.creado_en DESC`).all(),

  crear: ({ reserva_id, monto, metodo }) =>
    db.prepare("INSERT INTO pagos (reserva_id,monto,metodo,estado) VALUES (?,?,?,'pagado')").run(reserva_id, monto, metodo),

  porReserva: (reservaId) => db.prepare('SELECT * FROM pagos WHERE reserva_id = ?').all(reservaId),
};

module.exports = Pago;

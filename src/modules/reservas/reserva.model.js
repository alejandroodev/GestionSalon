const { db } = require('../../db');

const Reserva = {
  delUsuario: (usuarioId) => db.prepare(`
    SELECT r.*, s.nombre AS salon_nombre, s.precio_hora
    FROM reservas r JOIN salones s ON s.id = r.salon_id
    WHERE r.usuario_id = ? ORDER BY r.fecha DESC, r.hora_inicio DESC`).all(usuarioId),

  todas: () => db.prepare(`
    SELECT r.*, s.nombre AS salon_nombre, u.nombre AS cliente_nombre
    FROM reservas r
    JOIN salones s ON s.id = r.salon_id
    JOIN usuarios u ON u.id = r.usuario_id
    ORDER BY r.fecha DESC, r.hora_inicio DESC`).all(),

  byId: (id) => db.prepare(`
    SELECT r.*, s.nombre AS salon_nombre, s.precio_hora, u.nombre AS cliente_nombre
    FROM reservas r
    JOIN salones s ON s.id = r.salon_id
    JOIN usuarios u ON u.id = r.usuario_id
    WHERE r.id = ?`).get(id),

  crear: (r) => db.prepare(
    'INSERT INTO reservas (usuario_id,salon_id,fecha,hora_inicio,hora_fin) VALUES (?,?,?,?,?)'
  ).run(r.usuario_id, r.salon_id, r.fecha, r.hora_inicio, r.hora_fin),

  actualizar: (id, r) => db.prepare(
    'UPDATE reservas SET usuario_id=?, salon_id=?, fecha=?, hora_inicio=?, hora_fin=?, estado=? WHERE id=?'
  ).run(r.usuario_id, r.salon_id, r.fecha, r.hora_inicio, r.hora_fin, r.estado, id),

  cancelar: (id) => db.prepare("UPDATE reservas SET estado='cancelada' WHERE id=?").run(id),

  activar: (id) => db.prepare("UPDATE reservas SET estado='activa' WHERE id=? AND estado='pendiente'").run(id),
};

module.exports = Reserva;

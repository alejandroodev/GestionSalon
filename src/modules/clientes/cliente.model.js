const { db } = require('../../db');

const Cliente = {
  all: () => db.prepare("SELECT id,nombre,email,telefono,creado_en FROM usuarios WHERE rol='cliente' ORDER BY nombre").all(),
  byId: (id) => db.prepare("SELECT id,nombre,email,telefono,creado_en FROM usuarios WHERE id=? AND rol='cliente'").get(id),
  actualizar: (id, { nombre, telefono }) =>
    db.prepare('UPDATE usuarios SET nombre=?, telefono=? WHERE id=?').run(nombre, telefono || null, id),
  historial: (id) => db.prepare(`
    SELECT r.*, s.nombre AS salon_nombre
    FROM reservas r JOIN salones s ON s.id = r.salon_id
    WHERE r.usuario_id = ?
    ORDER BY r.fecha DESC, r.hora_inicio DESC`).all(id),
};

module.exports = Cliente;

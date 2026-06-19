const { db } = require('../../db');

const Salon = {
  all: () => db.prepare('SELECT * FROM salones ORDER BY nombre').all(),
  activos: () => db.prepare('SELECT * FROM salones WHERE activo = 1 ORDER BY nombre').all(),
  byId: (id) => db.prepare('SELECT * FROM salones WHERE id = ?').get(id),
  crear: (s) => db.prepare(
    'INSERT INTO salones (nombre,ubicacion,capacidad,caracteristicas,precio_hora,hora_apertura,hora_cierre) VALUES (?,?,?,?,?,?,?)'
  ).run(s.nombre, s.ubicacion, s.capacidad, s.caracteristicas || null, s.precio_hora || 0,
        s.hora_apertura || '08:00', s.hora_cierre || '22:00'),
  actualizar: (id, s) => db.prepare(
    'UPDATE salones SET nombre=?, ubicacion=?, capacidad=?, caracteristicas=?, precio_hora=?, hora_apertura=?, hora_cierre=?, activo=? WHERE id=?'
  ).run(s.nombre, s.ubicacion, s.capacidad, s.caracteristicas || null, s.precio_hora || 0,
        s.hora_apertura || '08:00', s.hora_cierre || '22:00', s.activo ? 1 : 0, id),
  eliminar: (id) => db.prepare('DELETE FROM salones WHERE id = ?').run(id),

  hayChoque: (salonId, fecha, hi, hf, excluirReservaId = null) => {
    const sql = `SELECT 1 FROM reservas
      WHERE salon_id = ? AND fecha = ? AND estado = 'activa'
        AND NOT (hora_fin <= ? OR hora_inicio >= ?)
        ${excluirReservaId ? 'AND id <> ?' : ''}
      LIMIT 1`;
    const params = excluirReservaId ? [salonId, fecha, hi, hf, excluirReservaId] : [salonId, fecha, hi, hf];
    return !!db.prepare(sql).get(...params);
  },

  reservasDeFecha: (salonId, fecha) =>
    db.prepare(`SELECT hora_inicio, hora_fin FROM reservas
                WHERE salon_id=? AND fecha=? AND estado='activa'
                ORDER BY hora_inicio`).all(salonId, fecha),
};

module.exports = Salon;

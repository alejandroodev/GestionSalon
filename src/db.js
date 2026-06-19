const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, '..', 'data.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function hash(pwd, salt = crypto.randomBytes(16).toString('hex')) {
  const h = crypto.scryptSync(pwd, salt, 64).toString('hex');
  return `${salt}:${h}`;
}
function verify(pwd, stored) {
  const [salt, h] = stored.split(':');
  const calc = crypto.scryptSync(pwd, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(calc, 'hex'));
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefono TEXT,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('admin','cliente')) DEFAULT 'cliente',
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS salones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ubicacion TEXT NOT NULL,
      capacidad INTEGER NOT NULL CHECK(capacidad > 0),
      caracteristicas TEXT,
      precio_hora REAL NOT NULL DEFAULT 0,
      hora_apertura TEXT NOT NULL DEFAULT '08:00',
      hora_cierre TEXT NOT NULL DEFAULT '22:00',
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      salon_id INTEGER NOT NULL REFERENCES salones(id),
      fecha TEXT NOT NULL,            -- YYYY-MM-DD
      hora_inicio TEXT NOT NULL,      -- HH:MM
      hora_fin TEXT NOT NULL,         -- HH:MM
      estado TEXT NOT NULL DEFAULT 'activa' CHECK(estado IN ('activa','cancelada','finalizada')),
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_reservas_salon_fecha ON reservas(salon_id, fecha);
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reserva_id INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
      monto REAL NOT NULL,
      metodo TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','pagado','reembolsado')),
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migración: agrega columnas de horario a BD ya existentes (ignora si ya están)
  const cols = db.prepare('PRAGMA table_info(salones)').all().map(c => c.name);
  if (!cols.includes('hora_apertura')) db.exec("ALTER TABLE salones ADD COLUMN hora_apertura TEXT NOT NULL DEFAULT '08:00'");
  if (!cols.includes('hora_cierre')) db.exec("ALTER TABLE salones ADD COLUMN hora_cierre TEXT NOT NULL DEFAULT '22:00'");

  // Crea el admin si todavía no existe
  const admin = db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get('admin@local');
  if (!admin) {
    db.prepare('INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)')
      .run('Administrador', 'admin@local', hash('admin123'), 'admin');
    console.log('Admin sembrado: admin@local / admin123');
  }
}

module.exports = { db, initDb, hash, verify };

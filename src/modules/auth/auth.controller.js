const { db, hash, verify } = require('../../db');

exports.loginForm = (req, res) => res.render('auth/login', { error: null });
exports.registroForm = (req, res) => res.render('auth/registro', { error: null });

exports.login = (req, res) => {
  const { email, password } = req.body;
  const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!u || !verify(password, u.password)) {
    return res.status(401).render('auth/login', { error: 'Credenciales inválidas' });
  }
  req.session.user = { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol };
  res.redirect(u.rol === 'admin' ? '/salones' : '/reservas');
};

exports.registro = (req, res) => {
  const { nombre, email, telefono, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).render('auth/registro', { error: 'Todos los campos requeridos' });
  }
  try {
    const info = db.prepare(
      'INSERT INTO usuarios (nombre,email,telefono,password,rol) VALUES (?,?,?,?,?)'
    ).run(nombre, email, telefono || null, hash(password), 'cliente');
    req.session.user = { id: info.lastInsertRowid, nombre, email, rol: 'cliente' };
    res.redirect('/reservas');
  } catch (e) {
    res.status(400).render('auth/registro', { error: 'Email ya registrado' });
  }
};

exports.logout = (req, res) => req.session.destroy(() => res.redirect('/login'));

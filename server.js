const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDb } = require('./src/db');

const app = express();
initDb();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '#adg015l.15',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => res.redirect(req.session.user ? '/salones' : '/login'));

app.use('/', require('./src/modules/auth/auth.routes'));
app.use('/salones', require('./src/modules/salones/salon.routes'));
app.use('/clientes', require('./src/modules/clientes/cliente.routes'));
app.use('/reservas', require('./src/modules/reservas/reserva.routes'));
app.use('/pagos', require('./src/modules/pagos/pago.routes'));

app.use((req, res) => res.status(404).render('error', { msg: 'No encontrado' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).render('error', { msg: err.message || 'Error interno' });
});

const port = 3002;
app.listen(port, () => console.log(`http://localhost:${port}`));

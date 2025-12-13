const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { login, authenticateToken } = require('./auth');

const app = express();
const port = 3000;

console.log('INDEX.JS LOADED');

// ========================================
//  CORS MIDDLEWARE (Preflight dahil)
// ========================================
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],  // frontend origin'leri
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

app.use(cors(corsOptions));

// Burada app.options('*', ...) SATIRI YOK

console.log('CORS MIDDLEWARE APPLIED');

app.use(express.json());

// ========================================
//  MySQL Connection Pool
// ========================================
const pool = mysql.createPool({
  host: 'localhost',
  user: 'apiuser',
  password: 'apipassword',
  database: 'new_schemaSkyroster_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('MySQL Pool Created');

// ========================================
//  AUTH ROUTES
// ========================================

// POST /auth/login  → JWT üretir
app.post('/auth/login', (req, res) => login(req, res, pool));

// Basit health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
//  PROTECTED ROUTES (JWT zorunlu)
// ========================================

const flightsRouter = require('./routes/flights')(pool);
const cabinCrewRouter = require('./routes/cabinCrew')(pool);
const vehicleTypesRouter = require('./routes/vehicleTypes')(pool);
const menusRouter = require('./routes/menus')(pool);
const rolesRouter = require('./routes/roles')(pool);

app.use('/flights', authenticateToken, flightsRouter);
app.use('/cabincrew', authenticateToken, cabinCrewRouter);
app.use('/vehicletypes', authenticateToken, vehicleTypesRouter);
app.use('/menus', authenticateToken, menusRouter);
app.use('/roles', authenticateToken, rolesRouter);

// ========================================
//  404 ve ERROR HANDLER (opsiyonel)
// ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ========================================
//  START SERVER
// ========================================
app.listen(port, '0.0.0.0', () => {
  console.log('*** INDEX.JS SERVER STARTED ***');
  console.log(`Listening at http://0.0.0.0:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

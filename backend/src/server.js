// src/server.js
const express = require('express');

const assignSeatsRoute = require('./api/routes/assignSeatsRoute');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('server.js starting...');

app.use(express.json());

// health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// mount seat assignment route under /api
app.use('/api', assignSeatsRoute);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// backend/src/app.js
const express = require('express');
const app = express();

app.use(express.json());

// Simple logger so we can see what’s hitting the server
app.use((req, res, next) => {
  console.log('REQ', req.method, req.originalUrl);
  next();
});

// DEBUG ROUTE: POST /api/debug/ping
const debugRoute = require('./api/routes/debugRoute');
app.use('/api', debugRoute);

// ROSTER ROUTE: POST /api/flights/:flightId/roster
const rosterRoute = require('./api/routes/rosterRoute');
app.use('/api', rosterRoute);  // POST /api/flights/:flightId/roster

// SEAT ASSIGNMENT ROUTE: POST /api/assign-seats
const assignSeatsRoute = require('./api/routes/assignSeatsRoute');
app.use('/api', assignSeatsRoute); // POST /api/assign-seats

// 404 handler -> JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;



// backend/src/app.js
const express = require('express');
const app = express();

app.use(express.json());

// other routes...
// const rosterRoutes = require('./api/routes/rosterRoutes');
// app.use('/api/rosters', rosterRoutes);

const assignSeatsRoute = require('./api/routes/assignSeatsRoute');
app.use('/api', assignSeatsRoute); // gives POST /api/assign-seats

module.exports = app;

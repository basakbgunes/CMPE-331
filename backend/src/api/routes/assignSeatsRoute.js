// src/api/routes/assignSeatsRoute.js
const express = require('express');
const router = express.Router();

const { assignSeats } = require('../../../seat-assignment/seatAssignment');

// POST /api/assign-seats
// Body: { flightId, seatMap: { seats: [...] }, passengers: [...] }
router.post('/assign-seats', (req, res) => {
  try {
    const draftRoster = req.body;

    if (!draftRoster) {
      return res.status(400).json({ error: 'draftRoster (request body) is required.' });
    }

    if (!Array.isArray(draftRoster.passengers)) {
      return res.status(400).json({ error: 'draftRoster.passengers must be an array.' });
    }

    if (!draftRoster.seatMap || !Array.isArray(draftRoster.seatMap.seats)) {
      return res.status(400).json({ error: 'draftRoster.seatMap.seats must be an array.' });
    }

    const { passengers, seatMap } = draftRoster;
    const result = assignSeats(passengers, seatMap);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in /api/assign-seats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

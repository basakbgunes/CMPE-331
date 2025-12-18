// backend/src/api/routes/rosterRoute.js
const express = require('express');
const router = express.Router();

const { generateDraftRosterForFlight } = require('../../application/generateRosterService');
const { assignSeatsForDraftRoster } = require('../../application/assignSeatsService');

// POST /api/flights/:flightId/roster
// Generates draft roster AND runs seat assignment in one go
router.post('/flights/:flightId/roster', async (req, res, next) => {
  try {
    const { flightId } = req.params;

    // 1) Generate draft roster (pull pax + seatmap)
    const draftRoster = await generateDraftRosterForFlight(flightId);

    // 2) Assign seats
    const { seatAssignedRoster, warnings } =
      assignSeatsForDraftRoster(draftRoster);

    // 3) Return final roster to frontend
    return res.status(200).json({
      flightId,
      roster: seatAssignedRoster,
      warnings
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

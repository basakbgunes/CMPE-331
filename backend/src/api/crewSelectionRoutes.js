// backend/src/api/crewSelectionRoutes.js
const express = require("express");
const router = express.Router();

const {
  selectCrewForFlight
} = require("../domain/crew/crewSelection");

// POST /api/crew-selection
// Body: { flight: {...}, pilotPool: [...], cabinPool: [...] }
router.post("/crew-selection", (req, res) => {
  try {
    const { flight, pilotPool, cabinPool } = req.body || {};

    if (!flight || !pilotPool || !cabinPool) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "Body must contain flight, pilotPool, cabinPool."
      });
    }

    if (!flight.flightId || !flight.vehicleType || typeof flight.distanceKm !== "number") {
      return res.status(400).json({
        error: "INVALID_FLIGHT",
        message: "flight must include flightId, vehicleType, distanceKm (number)."
      });
    }

    if (!Array.isArray(pilotPool) || !Array.isArray(cabinPool)) {
      return res.status(400).json({
        error: "INVALID_POOLS",
        message: "pilotPool and cabinPool must be arrays."
      });
    }

    const result = selectCrewForFlight(flight, pilotPool, cabinPool);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in /api/crew-selection:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Crew selection failed."
    });
  }
});

module.exports = router;

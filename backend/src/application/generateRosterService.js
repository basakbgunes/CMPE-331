// backend/src/application/generateRosterService.js

const { getPassengersByFlightId } = require('../infrastructure/PassengerApiClient');
const { getSeatMapByAircraftType } = require('../infrastructure/PlaneConfigRepo');

/**
 * Generate a "draft roster" = Seat Map + Passengers for a given flight.
 * This is the thing we pass into assignSeatsForDraftRoster.
 */
async function generateDraftRosterForFlight(flightId) {
  if (!flightId) {
    throw new Error('flightId is required');
  }

  // TODO: Once you have real flight data, derive aircraftType from DB/API
  const aircraftType = 'DEMO_A320';

  const [passengers, seatMap] = await Promise.all([
    getPassengersByFlightId(flightId),
    getSeatMapByAircraftType(aircraftType)
  ]);

  return {
    flightId,
    aircraftType,
    seatMap,
    passengers
  };
}

module.exports = {
  generateDraftRosterForFlight
};

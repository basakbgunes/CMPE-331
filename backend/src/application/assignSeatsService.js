// backend/src/application/assignSeatsService.js

const { assignSeats } = require('../../seat-assignment/seatAssignment');

/**
 * draftRoster shape (minimal):
 * {
 *   flightId: string,
 *   seatMap: { seats: Seat[] },
 *   passengers: Passenger[]
 * }
 *
 * Returns a seat-assigned roster + warnings.
 */
function assignSeatsForDraftRoster(draftRoster) {
  if (!draftRoster) {
    throw new Error('draftRoster is required');
  }

  const { passengers, seatMap } = draftRoster;

  if (!Array.isArray(passengers)) {
    throw new Error('draftRoster.passengers must be an array');
  }
  if (!seatMap || !Array.isArray(seatMap.seats)) {
    throw new Error('draftRoster.seatMap.seats must be an array');
  }

  // Call your core algorithm
  const { passengers: updatedPassengers, warnings } = assignSeats(passengers, seatMap);

  // F16 – Seat plan proposals: paxId + seatNo, plus unseated[]
  const assignments = updatedPassengers
    .filter(p => p.seatNo)
    .map(p => ({ paxId: p.paxId, seatNo: p.seatNo }));

  const unseated = updatedPassengers
    .filter(p => !p.seatNo && (typeof p.age !== 'number' || p.age > 2)) // ignore infants
    .map(p => p.paxId);

  const seatAssignedRoster = {
    ...draftRoster,
    passengers: updatedPassengers,
    assignments,
    unseated
  };

  return {
    seatAssignedRoster,
    warnings
  };
}

module.exports = {
  assignSeatsForDraftRoster
};

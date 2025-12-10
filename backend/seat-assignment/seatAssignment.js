// seatAssignment.js

/**
 * @typedef {Object} Seat
 * @property {string} seatNo        // e.g. "12A"
 * @property {number} row           // 1-based row number
 * @property {number} colIndex      // 0-based column index within the row
 * @property {"business"|"economy"} cabinClass
 * @property {boolean} [isBlocked]
 * @property {boolean} [isCrewSeat]
 */

/**
 * @typedef {Object} Passenger
 * @property {string} paxId
 * @property {string} [name]
 * @property {number} [age]               // infants: 0–2 (no seat) (DR-05)
 * @property {"business"|"economy"} [seatType]
 * @property {string} [seatNo]            // may be pre-assigned by Passenger API
 * @property {string[]} [affiliateIds]    // other paxIds to seat adjacent to (if possible)
 * @property {string} [infantParentId]    // for infants, parent paxId
 */

/**
 * Assign seats for passengers without valid seatNo.
 *
 * Rules (from RS/DSD):
 * - Respect cabin class (business/economy). (FR-04)
 * - Preserve valid existing seatNo unless invalid or conflicting. (FR-04)
 * - Infants (age 0–2) never get a seat; they must be linked to a parent seat. (DR-05)
 * - Try to put affiliated passengers side by side in the same row. (FR-04 / US-03)
 * - No double-booking; respect blocked & crew seats from seat map. (DR-04)
 *
 * @param {Passenger[]} passengers
 * @param {{ seats: Seat[] }} seatMap
 * @param {{ preserveExisting?: boolean }} [options]
 * @returns {{ passengers: Passenger[], warnings: string[] }}
 */
function assignSeats(passengers, seatMap, options = {}) {
  const preserveExisting = options.preserveExisting !== false; // default true
  const warnings = [];

  const updatedPassengers = passengers.map(p => ({ ...p }));
  const passengerById = new Map(updatedPassengers.map(p => [p.paxId, p]));

  const seats = Array.isArray(seatMap.seats) ? seatMap.seats.slice() : [];
  const seatByNo = new Map(seats.map(s => [s.seatNo, s]));

  const occupiedSeats = new Set();
  // Treat crew seats as already occupied – we never assign passengers there
  for (const seat of seats) {
    if (seat.isCrewSeat) {
      occupiedSeats.add(seat.seatNo);
    }
  }

  const infants = [];
  const nonInfants = [];
  for (const p of updatedPassengers) {
    const age = typeof p.age === "number" ? p.age : undefined;
    if (age !== undefined && age <= 2) {
      infants.push(p);
    } else {
      nonInfants.push(p);
    }
  }

  // paxId -> seatNo
  const assignedSeatByPax = new Map();

  const getExpectedClass = (p) => {
    if (p.seatType === "business" || p.seatType === "economy") {
      return p.seatType;
    }
    return "economy"; // default fallback
  };

  // 1) Validate and preserve existing seat assignments (for non-infants)
  const unassignedNonInfants = [];
  for (const p of nonInfants) {
    if (preserveExisting && p.seatNo) {
      const seat = seatByNo.get(p.seatNo);
      const expectedClass = getExpectedClass(p);

      if (!seat) {
        warnings.push(`Passenger ${p.paxId} has invalid seat ${p.seatNo} (not in seat map).`);
        p.seatNo = undefined;
        unassignedNonInfants.push(p);
      } else if (seat.isBlocked || seat.isCrewSeat) {
        warnings.push(`Passenger ${p.paxId} has seat ${p.seatNo} which is blocked or reserved for crew.`);
        p.seatNo = undefined;
        unassignedNonInfants.push(p);
      } else if (seat.cabinClass && seat.cabinClass !== expectedClass) {
        warnings.push(
          `Passenger ${p.paxId} has seat ${p.seatNo} in ${seat.cabinClass} but expects ${expectedClass}.`
        );
        p.seatNo = undefined;
        unassignedNonInfants.push(p);
      } else if (occupiedSeats.has(seat.seatNo)) {
        warnings.push(`Seat ${seat.seatNo} is already occupied; removing from passenger ${p.paxId}.`);
        p.seatNo = undefined;
        unassignedNonInfants.push(p);
      } else {
        // Seat is valid and free
        assignedSeatByPax.set(p.paxId, seat.seatNo);
        occupiedSeats.add(seat.seatNo);
      }
    } else {
      // No seat or we are ignoring existing
      p.seatNo = undefined;
      unassignedNonInfants.push(p);
    }
  }

  // 2) Build available seats per class (not blocked, not crew, not occupied)
  const availableSeatsByClass = { business: [], economy: [] };
  for (const seat of seats) {
    if (seat.isBlocked || seat.isCrewSeat) continue;
    if (occupiedSeats.has(seat.seatNo)) continue;

    const cabinClass = seat.cabinClass === "business" ? "business" : "economy";
    availableSeatsByClass[cabinClass].push(seat);
  }

  const sortSeats = (a, b) => a.row - b.row || a.colIndex - b.colIndex;
  availableSeatsByClass.business.sort(sortSeats);
  availableSeatsByClass.economy.sort(sortSeats);

  // 3) Group passengers by affiliateIds – adjacency solver will use these groups
  const paxLookup = new Map(unassignedNonInfants.map(p => [p.paxId, p]));
  const visited = new Set();
  const groups = [];

  function buildGroup(startPax) {
    const stack = [startPax];
    const group = [];
    visited.add(startPax.paxId);

    while (stack.length) {
      const p = stack.pop();
      group.push(p);
      const ids = Array.isArray(p.affiliateIds) ? p.affiliateIds : [];
      for (const id of ids) {
        const neighbor = paxLookup.get(id);
        if (neighbor && !visited.has(neighbor.paxId)) {
          visited.add(neighbor.paxId);
          stack.push(neighbor);
        }
      }
    }
    return group;
  }

  for (const p of unassignedNonInfants) {
    if (!visited.has(p.paxId)) {
      const group = buildGroup(p);
      groups.push(group);
    }
  }

  const multiGroups = groups.filter(g => g.length > 1);
  const singles = groups.filter(g => g.length === 1).map(g => g[0]);

  function inferGroupClass(group) {
    const counts = { business: 0, economy: 0 };
    for (const p of group) {
      const c = getExpectedClass(p);
      counts[c] += 1;
    }
    if (counts.business > 0 && counts.economy > 0) {
      warnings.push(
        `Affiliate group [${group.map(p => p.paxId).join(", ")}] spans multiple classes; defaulting to economy.`
      );
    }
    return counts.business > counts.economy ? "business" : "economy";
  }

  function findContiguousSeats(pool, groupSize) {
    // pool is assumed sorted by row, colIndex
    let i = 0;
    while (i < pool.length) {
      const rowNum = pool[i].row;
      const rowSeats = [];
      let j = i;
      while (j < pool.length && pool[j].row === rowNum) {
        rowSeats.push(pool[j]);
        j++;
      }

      if (rowSeats.length >= groupSize) {
        for (let start = 0; start <= rowSeats.length - groupSize; start++) {
          let ok = true;
          for (let k = 0; k < groupSize - 1; k++) {
            if (rowSeats[start + k + 1].colIndex !== rowSeats[start + k].colIndex + 1) {
              ok = false;
              break;
            }
          }
          if (ok) {
            return rowSeats.slice(start, start + groupSize); // contiguous block
          }
        }
      }

      i = j;
    }
    return null;
  }

  function removeSeatsFromPool(pool, seatsToRemove) {
    const toRemove = new Set(seatsToRemove.map(s => s.seatNo));
    return pool.filter(s => !toRemove.has(s.seatNo));
  }

  function assignGroupToSeats(group, cabinClass) {
    let pool = availableSeatsByClass[cabinClass] || [];
    if (!pool.length) {
      warnings.push(
        `No seats left in ${cabinClass} for group [${group.map(p => p.paxId).join(", ")}].`
      );
      return;
    }

    const contiguous = findContiguousSeats(pool, group.length);
    if (contiguous) {
      // Perfect adjacency
      for (let i = 0; i < group.length; i++) {
        const pax = group[i];
        const seat = contiguous[i];
        assignedSeatByPax.set(pax.paxId, seat.seatNo);
        occupiedSeats.add(seat.seatNo);
      }
      availableSeatsByClass[cabinClass] = removeSeatsFromPool(pool, contiguous);
    } else {
      // Fall back: take first N seats
      if (pool.length >= group.length) {
        warnings.push(
          `Could not find adjacent seats for group [${group.map(p => p.paxId).join(", ")}]; assigned nearest available.`
        );
        const chosen = pool.slice(0, group.length);
        for (let i = 0; i < group.length; i++) {
          const pax = group[i];
          const seat = chosen[i];
          assignedSeatByPax.set(pax.paxId, seat.seatNo);
          occupiedSeats.add(seat.seatNo);
        }
        availableSeatsByClass[cabinClass] = pool.slice(group.length);
      } else {
        warnings.push(
          `Not enough seats in ${cabinClass} for group [${group.map(p => p.paxId).join(", ")}]. Only ${pool.length} left.`
        );
        const chosen = pool.slice(); // all remaining
        for (let i = 0; i < chosen.length; i++) {
          const pax = group[i];
          const seat = chosen[i];
          assignedSeatByPax.set(pax.paxId, seat.seatNo);
          occupiedSeats.add(seat.seatNo);
        }
        availableSeatsByClass[cabinClass] = [];
        // remaining passengers in group stay unassigned
      }
    }
  }

  // 4) First assign multi-person affiliate groups (adjacency)
  for (const group of multiGroups) {
    const cabinClass = inferGroupClass(group);
    assignGroupToSeats(group, cabinClass);
  }

  // 5) Then assign singles greedily by class
  for (const p of singles) {
    const cabinClass = getExpectedClass(p);
    let pool = availableSeatsByClass[cabinClass] || [];
    if (!pool.length) {
      warnings.push(`No seats left in ${cabinClass} for passenger ${p.paxId}.`);
      continue;
    }
    const seat = pool[0];
    assignedSeatByPax.set(p.paxId, seat.seatNo);
    occupiedSeats.add(seat.seatNo);
    availableSeatsByClass[cabinClass] = pool.slice(1);
  }

  // 6) Validate infant-parent relationships (infants never get seats)
  for (const infant of infants) {
    if (!infant.infantParentId) {
      warnings.push(`Infant ${infant.paxId} has no infantParentId set.`);
      continue;
    }
    const parentId = infant.infantParentId;
    const parentSeat =
      assignedSeatByPax.get(parentId) ||
      (passengerById.get(parentId) && passengerById.get(parentId).seatNo);
    if (!parentSeat) {
      warnings.push(
        `Infant ${infant.paxId} is linked to parent ${parentId}, but parent has no seat assigned.`
      );
    }
    // We explicitly ensure infant has no seatNo
    infant.seatNo = undefined;
  }

  // 7) Copy assigned seat numbers back into updatedPassengers
  for (const p of updatedPassengers) {
    const assignedSeat = assignedSeatByPax.get(p.paxId);
    if (assignedSeat) {
      p.seatNo = assignedSeat;
    }
  }

  return {
    passengers: updatedPassengers,
    warnings
  };
}

module.exports = {
  assignSeats
};

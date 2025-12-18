// backend/src/infrastructure/PlaneConfigRepo.js

// TEMP: just one hardcoded seat map for demo
const demoSeatMap = {
  seats: [
    // Row 1 – business
    { seatNo: "1A", row: 1, colIndex: 0, cabinClass: "business" },
    { seatNo: "1B", row: 1, colIndex: 1, cabinClass: "business" },
    { seatNo: "1C", row: 1, colIndex: 2, cabinClass: "business" },
    { seatNo: "1D", row: 1, colIndex: 3, cabinClass: "business" },

    // Row 2 – economy
    { seatNo: "2A", row: 2, colIndex: 0, cabinClass: "economy" },
    { seatNo: "2B", row: 2, colIndex: 1, cabinClass: "economy" },
    { seatNo: "2C", row: 2, colIndex: 2, cabinClass: "economy" },
    { seatNo: "2D", row: 2, colIndex: 3, cabinClass: "economy" },

    // Row 3 – economy
    { seatNo: "3A", row: 3, colIndex: 0, cabinClass: "economy" },
    { seatNo: "3B", row: 3, colIndex: 1, cabinClass: "economy" },
    { seatNo: "3C", row: 3, colIndex: 2, cabinClass: "economy" },
    { seatNo: "3D", row: 3, colIndex: 3, cabinClass: "economy" }
  ]
};

/**
 * For now we ignore aircraftType and just return demoSeatMap.
 * Later: use aircraftType (A320, B737, etc.) to select correct JSON.
 */
async function getSeatMapByAircraftType(aircraftType) {
  return demoSeatMap;
}

module.exports = {
  getSeatMapByAircraftType
};

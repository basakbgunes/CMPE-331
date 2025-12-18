
// backend/src/infrastructure/PassengerApiClient.js

// TODO: Replace with real HTTP calls later
async function getPassengersByFlightId(flightId) {
  // TEMP stub: return fake data
  return [
    {
      paxId: "P1",
      name: "Alice",
      age: 35,
      seatType: "economy",
      affiliateIds: ["P2", "P3"]
    },
    {
      paxId: "P2",
      name: "Bob",
      age: 37,
      seatType: "economy",
      affiliateIds: ["P1", "P3"]
    },
    {
      paxId: "P3",
      name: "Charlie",
      age: 8,
      seatType: "economy",
      affiliateIds: ["P1", "P2"]
    },
    {
      paxId: "P4",
      name: "Business Lady",
      age: 40,
      seatType: "business",
      seatNo: "1A"
    },
    {
      paxId: "P5",
      name: "Infant",
      age: 1,
      seatType: "economy",
      infantParentId: "P6"
    },
    {
      paxId: "P6",
      name: "Parent",
      age: 30,
      seatType: "economy",
      affiliateIds: ["P5"]
    }
  ];
}

module.exports = {
  getPassengersByFlightId
};

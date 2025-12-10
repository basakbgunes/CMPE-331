// example.js
const { assignSeats } = require("./seatAssignment");

function demo() {
  const seatMap = {
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

  const passengers = [
    // A family of 3 in economy with affiliates – should be seated 2B–2D, for example
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

    // Business passenger with a pre-assigned seat
    {
      paxId: "P4",
      name: "Business Lady",
      age: 40,
      seatType: "business",
      seatNo: "1A"
    },

    // Infant + parent
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

  const { passengers: assigned, warnings } = assignSeats(passengers, seatMap);

  console.log("Warnings:");
  for (const w of warnings) console.log(" -", w);

  console.log("\nAssigned passengers:");
  console.table(
    assigned.map(p => ({
      paxId: p.paxId,
      name: p.name,
      age: p.age,
      seatType: p.seatType,
      seatNo: p.seatNo,
      affiliates: p.affiliateIds,
      infantParentId: p.infantParentId
    }))
  );
}

demo();

// example.js
const {
  selectCrewForFlight
} = require("./crewSelection");

const flight = {
  flightId: "AA1234",
  vehicleType: "A320",
  distanceKm: 2500
};

const pilots = [
  { pilotId: "P1", name: "Alice", vehicleType: "A320", maxDistanceKm: 5000, seniority: "senior" },
  { pilotId: "P2", name: "Bob",   vehicleType: "A320", maxDistanceKm: 3000, seniority: "junior" },
  { pilotId: "P3", name: "Cara",  vehicleType: "A320", maxDistanceKm: 8000, seniority: "junior" },
  { pilotId: "P4", name: "Dan",   vehicleType: "A320", maxDistanceKm: 1500, seniority: "trainee" } // too short range -> filtered out
];

const cabin = [
  { attendantId: "C1", name: "Chief1", vehicleTypes: ["A320"], isChief: true,  isJunior: false, isChef: false, recipes: [] },
  { attendantId: "C2", name: "J1",     vehicleTypes: ["A320"], isChief: false, isJunior: true,  isChef: false, recipes: [] },
  { attendantId: "C3", name: "J2",     vehicleTypes: ["A320"], isChief: false, isJunior: true,  isChef: false, recipes: [] },
  { attendantId: "C4", name: "J3",     vehicleTypes: ["A320"], isChief: false, isJunior: true,  isChef: false, recipes: [] },
  { attendantId: "C5", name: "J4",     vehicleTypes: ["A320"], isChief: false, isJunior: true,  isChef: false, recipes: [] },
  { attendantId: "C6", name: "Chef1",  vehicleTypes: ["A320"], isChief: false, isJunior: false, isChef: true,  recipes: ["Soup", "Pasta"] }
];

const result = selectCrewForFlight(flight, pilots, cabin);

console.log("Selected pilots:", result.pilots.map(p => `${p.pilotId} (${p.seniority})`));
console.log("Selected cabin:", result.cabin.map(c => `${c.attendantId}${c.isChief ? "[chief]" : c.isChef ? "[chef]" : "[junior]"}`));
console.log("Selected recipes:", result.selectedRecipes);
console.log("Warnings:");
for (const w of result.warnings) {
  console.log(`- [${w.severity}] ${w.code}: ${w.message}`);
}

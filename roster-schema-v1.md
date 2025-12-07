// core person types (match your APIs)
type Pilot = {
  pilotId: string;
  name: string;
  langs: string[];
  vehicleType: string;
  maxDistanceKm: number;
  seniority: "senior" | "junior" | "trainee";
};

type CabinCrewMember = {
  attendantId: string;
  name: string;
  langs: string[];
  types: ("chief" | "junior" | "chef")[];
  isChief: boolean;
  isJunior: boolean;
  isChef: boolean;
  recipes: string[];
};

type Passenger = {
  paxId: string;
  name: string;
  age: number;
  seatType: "business" | "economy";
  seatNo?: string;                // may be empty before assignment
  affiliateIds: string[];         // family/friends
  infantParentId?: string;        // for 0–2 ages
};

type Warning = {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  refs: string[];                 // e.g. ["pilot:123", "seat:12A"]
};

type SeatAssignment = {
  paxId: string;
  seatNo: string;
};

type Approval = {
  userId: string;
  role: string;
  status: "approved" | "unapproved";
  timestamp: string;              // ISO date
};

type AuditEntry = {
  userId: string;
  action: "save" | "retrieve" | "export" | "import";
  timestamp: string;
  hash: string;                   // payload hash, per RS note
};

type Roster = {
  rosterId: string;
  flightId: string;

  // core data
  pilots: Pilot[];
  cabin: CabinCrewMember[];
  passengers: Passenger[];

  // results
  warnings: Warning[];            // F12
  assignments: SeatAssignment[];  // F18
  approvals: Approval[];

  // technical / storage info
  backend: "sql" | "nosql";       // F19
  savedAt?: string;
  hash?: string;

  audit: AuditEntry[];
};

{
  "rosterId": "R-2025-0001",
  "flightId": "AA1243",
  "backend": "sql",
  "pilots": [],
  "cabin": [],
  "passengers": [],
  "warnings": [],
  "assignments": [],
  "approvals": [],
  "savedAt": null,
  "hash": null,
  "audit": []
}


## 1. SQL Schema


CREATE TABLE rosters (
    id           VARCHAR(50) PRIMARY KEY,   -- same as rosterId
    flight_id    VARCHAR(20) NOT NULL,
    backend      VARCHAR(10) NOT NULL,      -- 'sql' or 'nosql' choice at creation time
    status       VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft/approved, etc.
    saved_at     TIMESTAMP NOT NULL,
    hash         VARCHAR(128),              -- payload hash (optional for now)

    payload      JSON NOT NULL              -- full Roster JSON as per roster-schema-v1
);

CREATE INDEX idx_rosters_flight_id ON rosters(flight_id);
CREATE INDEX idx_rosters_status    ON rosters(status);

## 2. NoSQL Schema

// collection: rosters
{
  "_id": "R-2025-0001",       // same as rosterId
  "flightId": "AA1243",
  "status": "approved",
  "savedAt": "2025-12-05T12:34:56Z",
  "hash": "abc123...",        // optional

  "payload": {                // the same Roster JSON
    "rosterId": "R-2025-0001",
    "flightId": "AA1243",
    "backend": "nosql",
    "pilots": [ /* ... */ ],
    "cabin": [ /* ... */ ],
    "passengers": [ /* ... */ ],
    "warnings": [],
    "assignments": [],
    "approvals": [],
    "savedAt": "2025-12-05T12:34:56Z",
    "hash": "abc123...",
    "audit": []
  }
}

## 3. Notes
- `payload` always contains the full Roster JSON.
- `rosterId` = primary key in both systems.
- Indexes recommended (flightId, status).

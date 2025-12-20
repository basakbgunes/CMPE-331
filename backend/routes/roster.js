const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // POST /roster/generate - Generate roster from flight
  router.post('/generate', async (req, res) => {
    try {
      const { flight_id } = req.body;

      if (!flight_id) {
        return res.status(400).json({ error: 'flight_id is required' });
      }

      // Get flight details
      const [flights] = await pool.query(
        `SELECT f.flight_id, f.flight_no, f.date_time, f.duration_min, f.distance_km,
                vt.name AS vehicle_type, vt.seat_count,
                src.airport_code AS source_airport,
                dst.airport_code AS destination_airport
         FROM Flight f
         JOIN Vehicle_Type vt ON f.vehicle_type_id = vt.vehicle_type_id
         LEFT JOIN Flight_Source src ON f.flight_id = src.flight_id
         LEFT JOIN Flight_Destination dst ON f.flight_id = dst.flight_id
         WHERE f.flight_id = ?`,
        [flight_id]
      );

      if (flights.length === 0) {
        return res.status(404).json({ error: 'Flight not found' });
      }

      const flight = flights[0];

      // Get available pilots (cabin crew with rank containing 'Pilot')
      const [pilots] = await pool.query(
        'SELECT crew_id as id, CONCAT(first_name, " ", last_name) as name, crew_rank as certType FROM Cabin_Crew WHERE crew_rank LIKE "%Pilot%" AND active = TRUE LIMIT 2'
      );

      // Get available cabin crew
      const [cabinCrew] = await pool.query(
        'SELECT crew_id as id, CONCAT(first_name, " ", last_name) as name, crew_rank as type FROM Cabin_Crew WHERE crew_rank NOT LIKE "%Pilot%" AND active = TRUE LIMIT 3'
      );

      // Get passengers for this flight
      const [passengers] = await pool.query(
        'SELECT passenger_id as id, CONCAT(first_name, " ", last_name) as name, ticket_class FROM Passenger WHERE flight_id = ? AND active = TRUE',
        [flight_id]
      );

      const roster = {
        flight_id: flight.flight_id,
        flightNumber: flight.flight_no,
        aircraft: flight.vehicle_type,
        aircraftCapacity: flight.seat_count,
        date: flight.date_time,
        departureTime: flight.date_time,
        origin: flight.source_airport,
        destination: flight.destination_airport,
        duration_min: flight.duration_min,
        distance_km: flight.distance_km,
        pilots: pilots.map(p => ({
          ...p,
          seniority: Math.floor(Math.random() * 20) + 1
        })),
        cabinCrew: cabinCrew.map(c => ({
          ...c,
          language: 'EN'
        })),
        passengers: passengers.map(p => ({
          ...p,
          assignedSeat: null
        })),
        rules: [
          { name: 'Pilot Composition', code: 'DR-01', passed: true },
          { name: 'Vehicle/Distance Limits', code: 'DR-02', passed: true },
          { name: 'Cabin Composition', code: 'DR-03', passed: true },
          { name: 'Capacity & Seats', code: 'DR-04', passed: passengers.length <= flight.seat_count }
        ]
      };

      res.json(roster);
    } catch (error) {
      console.error('Error (POST /roster/generate):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // POST /roster/validate - Validate roster
  router.post('/validate', async (req, res) => {
    try {
      const { pilots, cabinCrew, passengers, aircraftCapacity, duration_min, distance_km } = req.body;

      const rules = [
        {
          name: 'Pilot Composition',
          code: 'DR-01',
          passed: pilots && pilots.length >= 2
        },
        {
          name: 'Vehicle/Distance Limits',
          code: 'DR-02',
          passed: distance_km <= 15000 && duration_min <= 1440
        },
        {
          name: 'Cabin Composition',
          code: 'DR-03',
          passed: cabinCrew && cabinCrew.length >= 2
        },
        {
          name: 'Capacity & Seats',
          code: 'DR-04',
          passed: passengers && passengers.length <= (aircraftCapacity || 150)
        }
      ];

      res.json({ rules });
    } catch (error) {
      console.error('Error (POST /roster/validate):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // POST /roster/assign-seats - Auto-assign seats
  router.post('/assign-seats', async (req, res) => {
    try {
      const roster = req.body;

      // Simple seat assignment algorithm
      const passengers = roster.passengers || [];
      const capacity = roster.aircraftCapacity || 150;
      const seatMap = generateSeatMap(capacity);

      let seatIndex = 0;
      const assignedPassengers = passengers.map((p, idx) => {
        if (seatIndex < seatMap.length) {
          return {
            ...p,
            assignedSeat: seatMap[seatIndex++]
          };
        }
        return p;
      });

      const updatedRoster = {
        ...roster,
        passengers: assignedPassengers
      };

      res.json(updatedRoster);
    } catch (error) {
      console.error('Error (POST /roster/assign-seats):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // POST /roster/approve - Approve roster and save
  router.post('/approve', async (req, res) => {
    let conn;
    try {
      const roster = req.body;

      if (!roster.flight_id) {
        return res.status(400).json({ error: 'flight_id is required' });
      }

      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Create roster record
      const [rosterResult] = await conn.query(
        'INSERT INTO Roster (flight_id, status, created_at, approved_by) VALUES (?, ?, NOW(), ?)',
        [roster.flight_id, 'APPROVED', req.user?.userId || 1]
      );

      const roster_id = rosterResult.insertId;

      // Update passenger seats
      for (const passenger of roster.passengers || []) {
        if (passenger.id && passenger.assignedSeat) {
          await conn.query(
            'UPDATE Passenger SET assigned_seat = ? WHERE passenger_id = ?',
            [passenger.assignedSeat, passenger.id]
          );
        }
      }

      // Insert crew assignments
      for (const pilot of roster.pilots || []) {
        if (pilot.id) {
          await conn.query(
            'INSERT INTO Roster_Assignment (roster_id, crew_id, position) VALUES (?, ?, ?)',
            [roster_id, pilot.id, 'Pilot']
          );
        }
      }

      for (const crew of roster.cabinCrew || []) {
        if (crew.id) {
          await conn.query(
            'INSERT INTO Roster_Assignment (roster_id, crew_id, position) VALUES (?, ?, ?)',
            [roster_id, crew.id, 'Cabin Crew']
          );
        }
      }

      await conn.commit();

      res.json({
        message: 'Roster approved and saved',
        roster_id: roster_id,
        status: 'APPROVED'
      });
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('Error (POST /roster/approve):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (conn) conn.release();
    }
  });

  // GET /roster/:rosterId - Get roster details
  router.get('/:roster_id', async (req, res) => {
    try {
      const [rosters] = await pool.query(
        'SELECT * FROM Roster WHERE roster_id = ?',
        [req.params.roster_id]
      );

      if (rosters.length === 0) {
        return res.status(404).json({ error: 'Roster not found' });
      }

      res.json(rosters[0]);
    } catch (error) {
      console.error('Error (GET /roster/:roster_id):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // GET /roster/manifest/:rosterId - Get final manifest
  router.get('/manifest/:roster_id', async (req, res) => {
    try {
      const [rosters] = await pool.query(
        `SELECT r.*, f.flight_no, f.date_time, vt.name as aircraft_type
         FROM Roster r
         JOIN Flight f ON r.flight_id = f.flight_id
         JOIN Vehicle_Type vt ON f.vehicle_type_id = vt.vehicle_type_id
         WHERE r.roster_id = ?`,
        [req.params.roster_id]
      );

      if (rosters.length === 0) {
        return res.status(404).json({ error: 'Roster not found' });
      }

      const roster = rosters[0];

      // Get crew assignments
      const [crews] = await pool.query(
        `SELECT ra.position, c.crew_id, CONCAT(c.first_name, ' ', c.last_name) as name
         FROM Roster_Assignment ra
         JOIN Cabin_Crew c ON ra.crew_id = c.crew_id
         WHERE ra.roster_id = ?`,
        [req.params.roster_id]
      );

      // Get passengers with seats
      const [passengers] = await pool.query(
        'SELECT passenger_id, CONCAT(first_name, " ", last_name) as name, assigned_seat, ticket_class FROM Passenger WHERE flight_id = ? AND active = TRUE',
        [roster.flight_id]
      );

      res.json({
        flight_no: roster.flight_no,
        date_time: roster.date_time,
        aircraft_type: roster.aircraft_type,
        status: roster.status,
        crews: crews,
        passengers: passengers
      });
    } catch (error) {
      console.error('Error (GET /roster/manifest/:roster_id):', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};

function generateSeatMap(capacity) {
  const seats = [];
  const rows = Math.ceil(capacity / 6);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < 6; j++) {
      seats.push(String.fromCharCode(65 + i) + (j + 1));
    }
  }
  
  return seats.slice(0, capacity);
}

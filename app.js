// app.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5004;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE BAĞLANTISI ---
const db = new sqlite3.Database("./passenger_api.db");

// TABLOLARI OLUŞTUR VE ÖRNEK VERİ EKLE
db.serialize(() => {
  // Passengers tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS passengers (
      pax_id TEXT PRIMARY KEY,
      flight_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      type TEXT NOT NULL,
      seat TEXT
    )
  `);

  // Affiliations tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS passenger_affiliations (
      pax_id TEXT NOT NULL,
      affiliate_id TEXT NOT NULL,
      PRIMARY KEY (pax_id, affiliate_id)
    )
  `);

  // Infants tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS infants (
      pax_id TEXT PRIMARY KEY,
      requires_seat INTEGER DEFAULT 0
    )
  `);

  // Eğer hiç yolcu yoksa örnek verileri ekle
  db.get(`SELECT COUNT(*) AS count FROM passengers`, (err, row) => {
    if (err) {
      console.error("DB sayım hatası:", err);
      return;
    }
    if (row.count === 0) {
      console.log("Örnek yolcular ekleniyor...");

      db.run(
        `INSERT INTO passengers (pax_id, flight_id, full_name, age, type, seat)
         VALUES 
         ('P001', 'TK1938', 'Ayşe Korkmaz', 32, 'adult', '12A'),
         ('P002', 'TK1938', 'Mehmet Korkmaz', 2, 'infant', NULL)`
      );

      db.run(
        `INSERT INTO passenger_affiliations (pax_id, affiliate_id)
         VALUES 
         ('P001', 'P002'),
         ('P002', 'P001')`
      );

      db.run(
        `INSERT INTO infants (pax_id, requires_seat)
         VALUES ('P002', 0)`
      );
    } else {
      console.log("Yolcu verisi zaten var, seed atlanıyor.");
    }
  });
});

// --- PROMISE HELPER FONKSİYONLAR ---
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// --- API ENDPOINTI ---

app.get("/api/passengers", async (req, res) => {
  try {
    const flightId = req.query.flightId;

    if (!flightId) {
      return res.status(400).json({ error: "flightId is required" });
    }

    // 1) Bu uçuşa ait yolcuları al
    const passengers = await allAsync(
      `SELECT * FROM passengers WHERE flight_id = ?`,
      [flightId]
    );

    if (passengers.length === 0) {
      return res
        .status(404)
        .json({ error: "No passengers found for this flight" });
    }

    const paxIds = passengers.map((p) => p.pax_id);

    // 2) Affiliate bilgilerini al
    let affiliates = [];
    if (paxIds.length > 0) {
      affiliates = await allAsync(
        `SELECT * FROM passenger_affiliations 
         WHERE pax_id IN (${paxIds.map(() => "?").join(",")})`,
        paxIds
      );
    }

    // 3) Infant kayıtlarını al
    let infants = [];
    if (paxIds.length > 0) {
      infants = await allAsync(
        `SELECT * FROM infants 
         WHERE pax_id IN (${paxIds.map(() => "?").join(",")})`,
        paxIds
      );
    }

    // 4) JSON objesini oluştur
    const infantSet = new Set(infants.map((i) => i.pax_id));

    const resultPassengers = passengers.map((p) => {
      const paxAffiliates = affiliates
        .filter((a) => a.pax_id === p.pax_id)
        .map((a) => a.affiliate_id);

      const specialNeeds = [];
      if (infantSet.has(p.pax_id)) {
        specialNeeds.push("infant");
      }

      return {
        paxId: p.pax_id,
        fullName: p.full_name,
        age: p.age,
        type: p.type,
        seat: p.seat,
        affiliateGroup: paxAffiliates,
        specialNeeds: specialNeeds,
      };
    });

    res.json({
      flightId,
      passengerCount: resultPassengers.length,
      passengers: resultPassengers,
    });
  } catch (err) {
    console.error("API hatası:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- SUNUCUYU BAŞLAT ---
app.listen(PORT, () => {
  console.log(`Passenger API Node.js versiyonu http://localhost:${PORT} üzerinde çalışıyor`);
});

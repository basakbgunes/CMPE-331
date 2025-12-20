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

// --- VALIDATION ENDPOINTS ---

// Validate passenger data
app.post("/api/validate/passenger", (req, res) => {
  const passenger = req.body;
  const alerts = [];

  // PAX ID validation
  if (!passenger.paxId || !String(passenger.paxId).trim()) {
    alerts.push({
      code: "PAX-001",
      message: "Yolcu ID boş olamaz",
      level: "error",
      entityType: "passenger",
      entityId: passenger.paxId
    });
  }

  // Full name validation
  if (!passenger.fullName || !String(passenger.fullName).trim()) {
    alerts.push({
      code: "PAX-002",
      message: "Yolcu adı boş olamaz",
      level: "error",
      entityType: "passenger",
      entityId: passenger.paxId
    });
  }

  // Age validation
  const age = passenger.age;
  if (age === null || age === undefined) {
    alerts.push({
      code: "PAX-003",
      message: "Yaş bilgisi eksik",
      level: "error",
      entityType: "passenger",
      entityId: passenger.paxId
    });
  } else {
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      alerts.push({
        code: "PAX-004",
        message: "Yaş geçerli bir sayı değil",
        level: "error",
        entityType: "passenger",
        entityId: passenger.paxId
      });
    } else if (ageNum < 0) {
      alerts.push({
        code: "PAX-005",
        message: "Yaş negatif olamaz",
        level: "error",
        entityType: "passenger",
        entityId: passenger.paxId
      });
    } else if (ageNum > 150) {
      alerts.push({
        code: "PAX-006",
        message: "Yaş değeri gerçekçi değil",
        level: "warning",
        entityType: "passenger",
        entityId: passenger.paxId,
        suggestion: `Yaş değeri (${ageNum}) kontrol edilmeli`
      });
    }
  }

  // Passenger type validation
  const validTypes = ["adult", "child", "infant"];
  if (!passenger.type || !validTypes.includes(passenger.type.toLowerCase())) {
    alerts.push({
      code: "PAX-008",
      message: `Yolcu tipi geçersiz. Geçerli tipler: ${validTypes.join(", ")}`,
      level: "error",
      entityType: "passenger",
      entityId: passenger.paxId
    });
  }

  res.json({
    isValid: alerts.filter(a => a.level === "error").length === 0,
    alerts: alerts
  });
});

// Validate entire roster
app.post("/api/validate/roster", (req, res) => {
  const roster = req.body;
  const alerts = [];

  // Pilot composition check
  const pilots = roster.pilots || [];
  if (pilots.length < 2) {
    alerts.push({
      code: "DR-01",
      message: "En az 2 pilot gerekli",
      level: "error",
      entityType: "roster",
      suggestion: "En az 1 senior ve 1 junior pilot ekleyin"
    });
  } else {
    const seniorCount = pilots.filter(p => p.rank === "senior").length;
    if (seniorCount < 1) {
      alerts.push({
        code: "DR-01-SENIOR",
        message: "En az 1 senior pilot gerekli",
        level: "error",
        entityType: "roster",
        suggestion: "Senior pilot ekleyin"
      });
    }
  }

  // Cabin crew composition
  const cabinCrew = roster.cabinCrew || [];
  const passengers = roster.passengers || [];
  const minCabinCrew = Math.max(1, Math.floor(passengers.length / 50));
  
  if (cabinCrew.length < minCabinCrew) {
    alerts.push({
      code: "DR-03",
      message: `Kabin görevlisi sayısı yetersiz (${cabinCrew.length}/${minCabinCrew})`,
      level: "warning",
      entityType: "roster",
      suggestion: `En az ${minCabinCrew} kabin görevlisi ekleyin`
    });
  }

  // Unassigned seats check
  const unassigned = passengers.filter(p => !p.seat);
  if (unassigned.length > 0) {
    alerts.push({
      code: "SEAT-001",
      message: `${unassigned.length} yolcunun koltuk ataması yapılmamış`,
      level: "warning",
      entityType: "roster",
      suggestion: "Tüm yolculara koltuk atayın"
    });
  }

  // Duplicate seat check
  const seats = passengers.map(p => p.seat).filter(s => s);
  const duplicates = new Set(seats.filter(s => seats.indexOf(s) !== seats.lastIndexOf(s)));
  if (duplicates.size > 0) {
    alerts.push({
      code: "SEAT-002",
      message: `Aynı koltuk birden fazla yolcuya atanmış: ${Array.from(duplicates).join(", ")}`,
      level: "error",
      entityType: "roster"
    });
  }

  // Aircraft capacity check
  const capacityMap = {
    "boeing747": 416,
    "boeing777": 396,
    "airbus380": 555,
    "airbus350": 325,
    "boeing787": 280
  };
  
  const aircraftType = (roster.aircraft?.type || "").toLowerCase();
  const maxCapacity = capacityMap[aircraftType] || 200;
  const totalPersonnel = passengers.length + cabinCrew.length + pilots.length;
  
  if (totalPersonnel > maxCapacity) {
    alerts.push({
      code: "CAPACITY-001",
      message: `Uçak kapasitesi aşılmış (${totalPersonnel}/${maxCapacity})`,
      level: "error",
      entityType: "roster",
      suggestion: `Maksimum ${maxCapacity} kişi olabilir`
    });
  }

  // Summary
  const errorCount = alerts.filter(a => a.level === "error").length;
  const warningCount = alerts.filter(a => a.level === "warning").length;

  res.json({
    isValid: errorCount === 0,
    summary: {
      totalAlerts: alerts.length,
      errors: errorCount,
      warnings: warningCount
    },
    alerts: alerts,
    timestamp: new Date().toISOString()
  });
});

// Batch validation for multiple passengers
app.post("/api/validate/passengers", (req, res) => {
  const passengers = req.body.passengers || [];
  const results = [];

  passengers.forEach(passenger => {
    const alerts = [];

    // PAX ID validation
    if (!passenger.paxId || !String(passenger.paxId).trim()) {
      alerts.push({
        code: "PAX-001",
        message: "Yolcu ID boş olamaz",
        level: "error",
        entityType: "passenger"
      });
    }

    // Full name validation
    if (!passenger.fullName || !String(passenger.fullName).trim()) {
      alerts.push({
        code: "PAX-002",
        message: "Yolcu adı boş olamaz",
        level: "error",
        entityType: "passenger"
      });
    }

    // Age validation
    const age = passenger.age;
    if (age === null || age === undefined) {
      alerts.push({
        code: "PAX-003",
        message: "Yaş bilgisi eksik",
        level: "error",
        entityType: "passenger"
      });
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
        alerts.push({
          code: "PAX-004",
          message: "Yaş geçerli bir sayı değil",
          level: "error",
          entityType: "passenger"
        });
      } else if (ageNum < 0 || ageNum > 150) {
        alerts.push({
          code: "PAX-005",
          message: "Yaş değeri geçerli değil",
          level: "warning",
          entityType: "passenger"
        });
      }
    }

    results.push({
      paxId: passenger.paxId,
      isValid: alerts.filter(a => a.level === "error").length === 0,
      alerts: alerts
    });
  });

  const totalErrors = results.reduce((sum, r) => sum + r.alerts.filter(a => a.level === "error").length, 0);
  
  res.json({
    isValid: totalErrors === 0,
    totalValidated: passengers.length,
    validCount: results.filter(r => r.isValid).length,
    results: results
  });
});

// --- SUNUCUYU BAŞLAT ---
app.listen(PORT, () => {
  console.log(`Passenger API Node.js versiyonu http://localhost:${PORT} üzerinde çalışıyor`);
});

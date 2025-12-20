# SkyRoster AI - Final Working State

## ✅ System Status: FULLY OPERATIONAL

### Quick Start
```bash
# Terminal 1: Start MySQL (if not running)
# Already configured: apiuser/apipassword, database: new_schemaSkyroster_db

# Terminal 2: Load seed data (first time only)
mysql -u apiuser -papipassword new_schemaSkyroster_db < database/seed_data_real.sql

# Terminal 3: Start backend
cd backend && node index.js
# Server runs on http://localhost:3000

# Terminal 4: Watch SCSS → CSS
npm run sass
# Compiles src/styles/main.scss → public/styles/main.css

# Terminal 5: Start frontend
# Serve frontend/public/ directory on http://localhost:5500
# (Use Live Server extension or: npx http-server frontend/public -p 5500)
```

### Login Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: Admin (full access)

## 📊 Data State

### Database Summary
- **Passengers**: 165 total
  - ADULT: 150
  - CHILD: 2 (get own seats)
  - INFANT: 13 (share parent seats)
- **Cabin Crew**: 40
- **Flights**: 15 (TK101-TK115)
- **Flight Assignments**: 75 crew, 2000+ passengers

### Key Data Points
- All INFANTs linked to parents (parent_passenger_id set)
- All INFANTs' parents guaranteed on same flight
- CHILDRENs (ID 119-120) have parent_id set and get own seats
- All flights assigned via BETWEEN ranges with parent validation

## 🎯 Feature Implementation

### S1: Login (index.html)
- Email/password authentication via JWT
- Role-based access control (Admin/CrewManager/Pilot/Cabin)

### S2: Flight Search (flight-search.html)
- Lists all 15 flights (TK101-TK115)
- Filters by number, date, origin, destination, aircraft
- Passes selected flight to S3 via sessionStorage

### S3: Roster Builder (roster-builder.html)
- Generates roster with real DB data
- Shows pilots, cabin crew, passengers
- Buttons to S4 (Seat Assignment) or S5 (Crew Edit)

### S4: Seat Assignment (seat-assignment.html)
- **Drag-and-drop** interface
- INFANTs: grayed out, cannot be dragged (sit with parent)
- CHILDRENs: fully draggable (own seat)
- ADULTs: fully draggable
- Auto-assign button (random seat allocation)
- Shows aircraft capacity and seat availability

### S5: Roster Edit & Approval (extended-roster.html)
- Edit crew details
- Approve button → creates Roster in DB
- Redirects to S6 (Manifest)

### S6: Final Manifest (final-manifest.html)
- Displays approved roster
- Shows flight info, pilots, crew, passengers
- Seat assignments:
  - ADULTs/CHILDRENs: show assigned seat (e.g., "A1")
  - INFANTs: show parent's seat + "(shared with parent)" (e.g., "A1 (shared with parent)")
  - TBD if not assigned

## 🔧 Recent Changes

### Frontend (main.js)
- **Line 689**: Only INFANTs grayed out; CHILDRENs can be dragged
- **Line 1176**: Manifest only checks INFANT parents (CHILDRENs show own seat)
- **Line 1183**: Display text "(shared with parent)" for INFANTs

### Backend (roster.js)
- `/roster/generate`: Returns passengers with passenger_type and parent_passenger_id
- `/roster/approve`: Creates Roster record in DB
- `/roster/manifest/:id`: Returns formatted manifest with passenger types

### Database (seed_data_real.sql)
- INFANTs (151-165) assigned parents 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 100, 110 (all within flight ranges)
- Flight_Passenger inserts include parent validation WHERE clause
- Passenger count: 165 (no orphaned passengers)

## 🐛 Known Fixes Applied
1. ✅ All INFANTs have parent_passenger_id set
2. ✅ No orphaned children on flights (parent validation in Flight_Passenger)
3. ✅ Pilot seniority displays correctly (crew_rank)
4. ✅ Manifest shows flight info (not N/A)
5. ✅ CHILD passengers can get own seats (not blocked like INFANTs)
6. ✅ INFANTs show parent seat in manifest

## 📁 File Structure
```
frontend/
  public/
    index.html              ← S1 Login
    flight-search.html      ← S2
    roster-builder.html     ← S3
    seat-assignment.html    ← S4
    extended-roster.html    ← S5
    final-manifest.html     ← S6
    main.js                 ← All logic
    styles/main.css         ← Compiled CSS
  src/
    styles/main.scss        ← Source styles

backend/
  index.js                  ← Express server
  auth.js                   ← JWT auth
  routes/
    roster.js               ← Roster endpoints
    flights.js              ← Flight CRUD
    cabinCrew.js            ← Crew CRUD
    vehicleTypes.js         ← Aircraft types

database/
  schema_skyroster.sql      ← DB schema
  seed_data_real.sql        ← Test data (165 passengers, 40 crew, 15 flights)
```

## 🚀 Deployment Notes
- No build tools required (vanilla JS, SASS compiler only)
- Restart backend after code changes
- Run `npm run sass` after CSS changes
- MySQL must be running and seeded
- CORS configured for localhost:5500

## ✨ All changes are committed to git
```bash
git log --oneline -1
# 030fcb8 Final roster system: Infants share parent seats...
```

Transfer this folder anywhere and run the Quick Start steps - everything will work the same way!

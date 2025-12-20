<<<<<<< HEAD
# Flight Roster System – Admin Console

This project is a simplified front-end prototype of the Admin Console screen (S6) from the Requirements Specification.

## Features
- Manage users & roles  
- Manage plane types  
- Upload seat map JSON  
- Clean UI  
- Fully responsive  

## Tabs
### Users & Roles
- Columns: Username, Email, Roles, Status, Last Login
- Actions: Edit, Deactivate, Reset
- Add User modal logic ready for integration

### Plane Types
- Columns: Plane Code, Business/Economy Seat Counts, Crew Seats, Default Menu
- Actions: Edit, Upload JSON, Remove

## Tech Stack
- HTML
- SCSS → CSS
- JavaScript
=======
# ✈️ SkyRoster AI: Flight Roster Management System

This project is a web-based system that optimizes flight roster creation, validation, seat assignment, and crew approval processes using AI-supported rules.

---

## 🚀 1. Project Development Status

| Phase | Responsibility | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend (S1-S6)** | **Elif T., Nisa Üstün** | **COMPLETED** ✅ | All 6 screens (Login to Manifest) and core JavaScript logic have been integrated and unified. |
| **Backend (API)** | **Başak B.G., Burak D., Haki Ata, Azra Çakır** | In Progress | API Integration is pending for all data operations. |

---

## 🎯 3. Validation & Alert System (NEW! ✨)

A comprehensive **validation and alert mechanism** has been implemented:

### Features
- ✅ Real-time form validation
- ✅ Backend validation API endpoints
- ✅ Color-coded alerts (Error, Warning, Info, Success)
- ✅ Batch validation support
- ✅ Turkish & English language support
- ✅ XSS protection
- ✅ 12+ validation rules
- ✅ 40+ error codes

### Quick Start

**1. Backend Validation Endpoints:**
```bash
POST /api/validate/passenger       # Validate individual passenger
POST /api/validate/roster          # Validate complete roster
POST /api/validate/passengers      # Batch validate passengers
```

**2. Frontend Usage:**
```javascript
// Show an alert
window.alertManager.addAlert({
    code: "PAX-001",
    message: "Passenger ID cannot be empty",
    level: "error",
    suggestion: "Enter a valid PAX ID"
});

// Validate passenger locally
PassengerValidator.validatePassenger({
    paxId: "P-001",
    fullName: "Ali Yıldız",
    age: 28,
    type: "adult"
});

// Validate via API
await window.apiValidator.validatePassenger({...});
```

### Documentation
- **[VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)** - Detailed API reference
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[validation-test.html](validation-test.html)** - Interactive test page

### Error Codes
- **PAX-xxx** - Passenger errors
- **CREW-xxx** - Crew errors
- **DR-xxx** - Roster/Design Rule errors
- **SEAT-xxx** - Seat assignment errors
- **CAPACITY-xxx** - Aircraft capacity errors

---

## 📚 Additional Resources

### Test the System
```bash
# Start backend server
node app.js

# Open test page
open validation-test.html

# Run demo functions in browser console
ValidationDemo.showBasicAlerts();
await ValidationDemo.validateCompleteRoster();
```

### Files Added/Modified
- `app.js` - Added 3 validation endpoints
- `src/scripts/validation.js` - Frontend validation system
- `src/scripts/validation-demo.js` - Demo functions
- `src/styles/main.scss` - Alert and form validation styles
- `public/*.html` - Alert container integration
- `validation-test.html` - Interactive test page

---

## 🌟 Key Components

### Backend
- **3 REST endpoints** for validation
- **12+ validation rules** for comprehensive checking
- **CORS enabled** for cross-origin requests

### Frontend
- **AlertManager** - Display and manage alerts
- **FormValidator** - Real-time form validation
- **PassengerValidator** - Passenger data validation
- **APIValidator** - Backend API integration
- **InlineValidator** - Inline field validation

### Styling
- **4 alert types** with distinct colors
- **Responsive design** for all screen sizes
- **Smooth animations** for better UX
- **Toast notifications** for user feedback

---

### A. Prerequisites

The following software must be installed on your computer to run the system:

* **Node.js** (includes npm)
* **Python 3.x** (Required to run the Backend Flask API)

### B. Installation and Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/basakbgunes/CMPE-331.git](https://github.com/basakbgunes/CMPE-331.git)
    cd CMPE-331
    ```
2.  **Switch to Development Branch:**
    ```bash
    git checkout feature/core-frontend-implementation
    ```
3.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
4.  **Install Backend Dependencies:**
    ```bash
    pip install -r requirements.txt 
    # Note: requirements.txt file must be provided by the Backend team.
    ```

### C. Running the Application

* **To Run Frontend:** Open the `index.html` file inside the `public` folder directly in your browser.
* **To Run Backend API:**
    ```bash
    # Backend team instructions will be placed here.
    python app.py 
    ```

---

## 💻 3. Architecture and Technologies

* **Frontend:** HTML5, SCSS (SASS), Vanilla JavaScript (ES6+)
* **Backend (API):** Python, Flask
* **Database:** SQLite/PostgreSQL
* **Version Control:** Git & GitHub

---

## 📝 4. Development Log (Elif T.)

* **2025-12-07:** All S1-S6 Frontend screens completed and unified. **Front-end development phase finished.**
* **Next Step:** Open Pull Request (PR) for Backend integration.tegration.
>>>>>>> feature/core-frontend-implementation

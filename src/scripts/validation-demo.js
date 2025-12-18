/**
 * Validation System Demo & Integration Examples
 * Shows how to use AlertManager, FormValidator, PassengerValidator
 */

// ============================================================
// 1. BASIC ALERT MANAGER USAGE
// ============================================================

function showBasicAlerts() {
    // Create or get global alert manager
    if (!window.alertManager) {
        window.alertManager = new AlertManager();
    }

    // Add different types of alerts
    window.alertManager.addAlert({
        code: "PAX-001",
        message: "Yolcu ID boş olamaz",
        level: "error",
        entityType: "passenger",
        entityId: "PAX-123"
    });

    window.alertManager.addAlert({
        code: "DR-03",
        message: "Kabin görevlisi sayısı yetersiz (2/3)",
        level: "warning",
        entityType: "roster",
        suggestion: "En az 3 kabin görevlisi ekleyin"
    });

    window.alertManager.addAlert({
        code: "SEAT-001",
        message: "Koltuk ataması tamamlandı",
        level: "success",
        entityType: "roster"
    });

    window.alertManager.addAlert({
        code: "INFO-001",
        message: "Doğrulama işlemi başlatılıyor...",
        level: "info",
        entityType: "roster"
    });

    console.log("Alerts added successfully");
}

// ============================================================
// 2. PASSENGER VALIDATION
// ============================================================

function validatePassengerForm() {
    const passenger = {
        paxId: document.getElementById("pax-id")?.value || "",
        fullName: document.getElementById("full-name")?.value || "",
        age: document.getElementById("age")?.value || "",
        type: document.getElementById("pax-type")?.value || ""
    };

    console.log("Validating passenger:", passenger);

    // Local validation
    const localAlerts = PassengerValidator.validatePassenger(passenger);
    
    localAlerts.forEach(alert => {
        window.alertManager.addAlert(alert);
    });

    return localAlerts.filter(a => a.level === "error").length === 0;
}

// ============================================================
// 3. API-BASED VALIDATION
// ============================================================

async function validatePassengerViaAPI() {
    const passenger = {
        paxId: "PAX-001",
        fullName: "John Doe",
        age: 35,
        type: "adult"
    };

    try {
        const result = await window.apiValidator.validatePassenger(passenger);
        
        result.alerts.forEach(alert => {
            window.alertManager.addAlert(alert);
        });

        console.log("API Validation Result:", result);
        return result.isValid;
    } catch (error) {
        console.error("API validation failed:", error);
        return false;
    }
}

// ============================================================
// 4. COMPLETE ROSTER VALIDATION
// ============================================================

async function validateCompleteRoster() {
    const roster = {
        flightId: "AA1243",
        aircraft: { type: "Boeing777" },
        pilots: [
            { crewId: "CPT-001", firstName: "Ali", lastName: "Yıldız", rank: "senior" },
            { crewId: "FO-001", firstName: "Mehmet", lastName: "Kaya", rank: "junior" }
        ],
        cabinCrew: [
            { crewId: "CA-001", firstName: "Fatima", lastName: "Şahin", languages: ["Turkish", "English"] },
            { crewId: "CA-002", firstName: "Ayşe", lastName: "Özkan", languages: ["Turkish"] }
        ],
        passengers: [
            { paxId: "P-001", fullName: "Zeynep Demirci", age: 28, type: "adult", seat: "1A" },
            { paxId: "P-002", fullName: "Murat Çelik", age: 45, type: "adult", seat: "1B" },
            { paxId: "P-003", fullName: "Elif Aksoy", age: 5, type: "child", seat: "2A" },
            { paxId: "P-004", fullName: "Emre Kaya", age: null, type: "adult", seat: null }
        ]
    };

    console.log("Validating roster:", roster);

    try {
        const result = await window.apiValidator.validateRoster(roster);
        
        // Display summary
        displayValidationSummary(result.summary);

        // Add alerts
        result.alerts.forEach(alert => {
            window.alertManager.addAlert(alert);
        });

        console.log("Roster Validation Result:", result);
        return result.isValid;
    } catch (error) {
        console.error("Roster validation failed:", error);
        return false;
    }
}

// ============================================================
// 5. FORM VALIDATOR
// ============================================================

function setupFormValidation() {
    const formValidator = new FormValidator();

    // Add rules for password field
    formValidator.addFieldRules("password", [
        {
            validate: (value) => value.length >= 8,
            message: "Şifre en az 8 karakter olmalı"
        },
        {
            validate: (value) => /[0-9]/.test(value),
            message: "Şifre en az bir rakam içermelidir"
        },
        {
            validate: (value) => /[A-Z]/.test(value),
            message: "Şifre en az bir büyük harf içermelidir"
        }
    ]);

    // Add rules for email field
    formValidator.addFieldRules("email", [
        {
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: "Geçerli bir email adresi girin"
        }
    ]);

    console.log("Form validation rules added");
    return formValidator;
}

// ============================================================
// 6. VALIDATION SUMMARY DISPLAY
// ============================================================

function displayValidationSummary(summary) {
    const container = document.createElement("div");
    container.className = "validation-summary";
    container.innerHTML = `
        <h3>Doğrulama Özeti</h3>
        <div class="summary-item">
            <span class="label">Toplam Uyarı:</span>
            <span class="count">${summary.totalAlerts}</span>
        </div>
        <div class="summary-item error-item">
            <span class="label">Hatalar:</span>
            <span class="count">${summary.errors}</span>
        </div>
        <div class="summary-item warning-item">
            <span class="label">Uyarılar:</span>
            <span class="count">${summary.warnings}</span>
        </div>
    `;
    
    const container_elem = document.querySelector(".alerts-container");
    if (container_elem) {
        container_elem.insertBefore(container, container_elem.firstChild);
    }
}

// ============================================================
// 7. CLEAR ALERTS
// ============================================================

function clearAllAlerts() {
    if (window.alertManager) {
        window.alertManager.clearAlerts();
        console.log("All alerts cleared");
    }
}

// ============================================================
// 8. GET ALERT SUMMARY
// ============================================================

function getAlertSummary() {
    if (window.alertManager) {
        const summary = window.alertManager.getSummary();
        console.log("Alert Summary:", summary);
        return summary;
    }
    return null;
}

// ============================================================
// 9. INLINE FIELD VALIDATION SETUP
// ============================================================

function setupInlineValidation() {
    const inlineValidator = new InlineValidator();

    // Setup email field validation
    inlineValidator.setupFieldValidation(
        "email-input",
        (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "email-error"
    );

    // Setup age field validation
    inlineValidator.setupFieldValidation(
        "age-input",
        (value) => {
            const age = parseInt(value);
            return !isNaN(age) && age >= 0 && age <= 150;
        },
        "age-error"
    );

    console.log("Inline validation setup complete");
}

// ============================================================
// 10. BATCH PASSENGER VALIDATION
// ============================================================

async function validateMultiplePassengers() {
    const passengers = [
        { paxId: "P-001", fullName: "Ali Yıldız", age: 28, type: "adult" },
        { paxId: "P-002", fullName: "Ayşe Kaya", age: 5, type: "child" },
        { paxId: "P-003", fullName: "", age: 45, type: "adult" }, // Error: empty name
        { paxId: "", fullName: "Fatima Demirci", age: 32, type: "adult" } // Error: empty ID
    ];

    try {
        const response = await fetch("http://localhost:5004/api/validate/passengers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passengers })
        });

        const result = await response.json();
        
        result.results.forEach(r => {
            r.alerts.forEach(alert => {
                window.alertManager.addAlert({
                    ...alert,
                    entityId: r.paxId
                });
            });
        });

        console.log("Batch validation result:", result);
        return result;
    } catch (error) {
        console.error("Batch validation error:", error);
    }
}

// ============================================================
// EXPORT FOR GLOBAL USE
// ============================================================

window.ValidationDemo = {
    showBasicAlerts,
    validatePassengerForm,
    validatePassengerViaAPI,
    validateCompleteRoster,
    setupFormValidation,
    displayValidationSummary,
    clearAllAlerts,
    getAlertSummary,
    setupInlineValidation,
    validateMultiplePassengers
};

console.log("✅ Validation Demo module loaded");
console.log("Usage: ValidationDemo.showBasicAlerts(), ValidationDemo.validateCompleteRoster(), etc.");

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Yardımcı Fonksiyonlar ve API Tanımları ---

    const PROVIDER_API_BASE = 'http://localhost:8080/api/v1/'; 
    
    // API Endpoints
    const LOGIN_API_URL = PROVIDER_API_BASE + 'auth/login'; 
    const FLIGHT_SEARCH_API_URL = PROVIDER_API_BASE + 'flights/search'; 
    const ROSTER_GENERATE_API_URL = PROVIDER_API_BASE + 'roster/generate';
    const ROSTER_VALIDATE_API_URL = PROVIDER_API_BASE + 'roster/validate';
    const ROSTER_APPROVE_API_URL = PROVIDER_API_BASE + 'roster/approve';
    const SEAT_ASSIGNMENT_API_URL = PROVIDER_API_BASE + 'roster/assign-seats'; 
    const FINAL_MANIFEST_API_URL = PROVIDER_API_BASE + 'roster/manifest'; // S6 için yeni API

    const loginErrorMessageDiv = document.getElementById('error-message'); 

    /**
     * Displays the error message on the screen. (Primarily used by S1)
     */
    function displayError(message, status = null) {
        if (loginErrorMessageDiv) {
            let fullMessage = status ? `[${status}] Error: ${message}` : message;
            loginErrorMessageDiv.textContent = fullMessage;
            loginErrorMessageDiv.style.display = 'block'; 
            console.error(fullMessage);
        } else {
            console.error(`Error: ${message}`);
        }
    }


    // --- S1: AUTHENTICATE LOGIC (Screen S1) ---

    function handleSuccessfulLogin(jwtToken, role) {
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userRole', role); 
        window.location.href = 'flight-search.html'; 
    }

    function initializeLogin() {
        console.log('--- Initializing Screen S1 (Login) ---');
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return; 

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            // S1 Mantığı...
        });
    }

    // --- S2: FLIGHT SEARCH & SELECTION LOGIC (Screen S2) ---

    let selectedFlight = null; 
    
    // (searchFlights, handleFlightSelection, renderFlightResults, updateContextArea fonksiyonları buraya eklenecek)

    function initializeFlightSearch() {
        console.log('--- Initializing Screen S2 (Flight Search) ---');
        // S2 Başlatma Mantığı...
    }

    // --- S3: ROSTER BUILDER & VALIDATION LOGIC (Screen S3) ---

    let currentRoster = null; 

    function initializeRosterBuilder() {
        console.log('--- Initializing Screen S3 (Roster Builder) ---');
        const generateBtn = document.getElementById('generate-roster-btn');
        if (!generateBtn) return; 
        
        // S3 Roster Generation Mantığı...

        // S5 ve S4 Buton Aksiyonları
        document.getElementById('seat-assignment-btn').addEventListener('click', () => {
            if (currentRoster) {
                 sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster)); 
                 window.location.href = 'seat-assignment.html'; // S4
            }
        });
        document.getElementById('edit-crew-btn').addEventListener('click', () => {
            if (currentRoster) {
                 sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster));
                 window.location.href = 'extended-roster.html'; // S5
            }
        });
        
        // ... (diğer S3 helper fonksiyonları: renderRosterSummary, renderValidationStatus buraya eklenecek)
    }

    // --- S4: SEAT ASSIGNMENT LOGIC (Screen S4) ---
    
    let currentRosterDraftS4 = null; 
    // (renderSeatGrid, renderUnassignedPassengers, handleDragStart, handleSeatDrop fonksiyonları buraya eklenecek)

    function initializeSeatAssignment() {
        console.log('--- Initializing Screen S4 (Seat Assignment) ---');
        const autoAssignBtn = document.getElementById('auto-assign-btn');
        if (!autoAssignBtn) return; 
        
        // S4 Başlatma ve Drag & Drop Mantığı...
    }
    
    // --- S5: CREW EDIT & APPROVAL LOGIC (Screen S5) ---
    
    let currentRosterDraftS5 = null; 

    // (revalidateRoster, renderRosterTables, renderValidationStatusS5 fonksiyonları buraya eklenecek)

    function initializeRosterEdit() {
        console.log('--- Initializing Screen S5 (Crew Edit) ---');
        
        const approvalBtn = document.getElementById('approve-roster-btn');
        const revalidateBtn = document.getElementById('re-validate-btn');
        if (!approvalBtn) return; 

        const jwtToken = localStorage.getItem('jwtToken');
        const rosterDraftString = sessionStorage.getItem('currentRosterDraft');

        if (!jwtToken || !rosterDraftString) {
            alert('Missing authentication or Roster Draft. Returning to Roster Builder.');
            window.location.href = 'roster-builder.html';
            return;
        }

        currentRosterDraftS5 = JSON.parse(rosterDraftString);
        
        // Başlangıçta kural doğrulamasını çalıştır
        // revalidateRoster(currentRosterDraftS5, jwtToken); // Başlangıçta validasyonu çalıştır.

        // Approve Roster (UC05, FR-06)
        approvalBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to approve this Roster? This action is final and will proceed to publishing.')) {
                // S5 Onay (Approval) Mantığı...
                
                try {
                    const response = await fetch(ROSTER_APPROVE_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${jwtToken}`
                        },
                        body: JSON.stringify(currentRosterDraftS5) 
                    });
                    
                    if (response.ok) {
                        alert('Roster successfully approved and published! Redirecting to manifest.');
                        // Onaylanan Roster'ı S6 için sakla
                        sessionStorage.setItem('finalRosterManifest', JSON.stringify(currentRosterDraftS5));
                        window.location.href = 'final-manifest.html'; // S6'ya yönlendir
                    } else {
                        // Hata yönetimi
                    }
                } catch (error) {
                    // Ağ hatası yönetimi
                }
            }
        });
        
        // ... (Diğer S5 Mantığı: renderRosterTables, Remove Crew Member aksiyonu buraya eklenecek)
    }

    // --- S6: FINAL MANIFEST LOGIC (Screen S6) ---

    function renderFinalManifest(finalRoster) {
        const flightContext = finalRoster.flight || {};

        // 1. Summary Doldurma (FR-07)
        document.getElementById('s6-flight-no').textContent = flightContext.flightNo || 'N/A';
        document.getElementById('s6-date-time').textContent = new Date(flightContext.dateTime).toLocaleString();
        document.getElementById('s6-aircraft').textContent = flightContext.vehicleType || 'N/A';
        document.getElementById('s6-pax-count').textContent = finalRoster.passengers.length;
        
        // 2. Crew Listelerini Doldurma
        const pilotList = document.getElementById('pilot-manifest-list');
        const cabinList = document.getElementById('cabin-manifest-list');
        
        pilotList.innerHTML = finalRoster.pilots.map(p => 
            `<li>${p.name} - ${p.seniority} Pilot (${p.licenseType})</li>`
        ).join('');

        cabinList.innerHTML = finalRoster.cabinCrew.map(c => 
            `<li>${c.name} - ${c.type} (${c.languages?.join(', ') || 'N/A'})</li>`
        ).join('');

        // 3. Passenger Manifest Tablosunu Doldurma (UC06)
        const paxTableBody = document.querySelector('#pax-manifest-table tbody');
        paxTableBody.innerHTML = '';
        
        // Koltuk numarasına göre sıralama
        const sortedPassengers = finalRoster.passengers.sort((a, b) => {
            if (a.seatNo < b.seatNo) return -1;
            if (a.seatNo > b.seatNo) return 1;
            return 0;
        });

        sortedPassengers.forEach(p => {
            const row = paxTableBody.insertRow();
            row.innerHTML = `
                <td>${p.seatNo || 'UNASSIGNED'}</td>
                <td>${p.name}</td>
                <td>${p.seatType || 'N/A'}</td>
                <td>${p.affiliatedPaxId || 'None'}</td>
            `;
        });
    }

    function initializeFinalManifest() {
        console.log('--- Initializing Screen S6 (Final Manifest) ---');
        
        const finalRosterString = sessionStorage.getItem('finalRosterManifest');
        if (!finalRosterString) {
            alert('No final roster found. Returning to Roster Builder.');
            window.location.href = 'roster-builder.html';
            return;
        }

        const finalRoster = JSON.parse(finalRosterString);

        // Header'ı güncelle
        document.getElementById('flight-context-header').querySelector('p').textContent = 
            `Flight: ${finalRoster.flight.flightNo} • Aircraft: ${finalRoster.flight.vehicleType} • Roster Status: APPROVED`;

        renderFinalManifest(finalRoster);
        
        // Print ve Download butonları (Simülasyon)
        document.getElementById('print-manifest-btn').addEventListener('click', () => {
            alert('Printing manifest (UC06)...');
            window.print(); 
        });
        
        document.getElementById('download-manifest-btn').addEventListener('click', () => {
            alert('Manifest downloaded as CSV (UC06).');
        });
    }

    // --- Sayfa Yükleme Kontrolü ---

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'flight-search.html') {
        initializeFlightSearch();
    } else if (currentPage === 'roster-builder.html') {
        initializeRosterBuilder();
    } else if (currentPage === 'seat-assignment.html') {
        initializeSeatAssignment();
    } else if (currentPage === 'extended-roster.html') {
        initializeRosterEdit();
    } else if (currentPage === 'final-manifest.html') {
        initializeFinalManifest(); // S6'yı Başlat
    } else {
        initializeLogin();
    }
});
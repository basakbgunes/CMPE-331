document.addEventListener('DOMContentLoaded', () => {
    // --- Global Yardımcı Fonksiyonlar ve API Tanımları ---

    // DİKKAT: Port 8080'den 3000'e güncellendi.
    const PROVIDER_API_BASE = 'http://localhost:3000/api/v1/'; 
    
    // API Endpoints
    const LOGIN_API_URL = PROVIDER_API_BASE + 'auth/login'; 
    const FLIGHT_SEARCH_API_URL = PROVIDER_API_BASE + 'flights/search'; 
    const ROSTER_GENERATE_API_URL = PROVIDER_API_BASE + 'roster/generate';
    const ROSTER_VALIDATE_API_URL = PROVIDER_API_BASE + 'roster/validate';
    const ROSTER_APPROVE_API_URL = PROVIDER_API_BASE + 'roster/approve';
    const SEAT_ASSIGNMENT_API_URL = PROVIDER_API_BASE + 'roster/assign-seats'; 
    const FINAL_MANIFEST_API_URL = PROVIDER_API_BASE + 'roster/manifest'; 

    const loginErrorMessageDiv = document.getElementById('error-message'); 

    /**
     * Hata mesajını gösterir.
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
    
    // --- Global: Role Restriction Logic (GÖREV 15) ---

    function applyRoleRestrictions() {
        const userRole = localStorage.getItem('userRole');
        if (!userRole) return; 

        // Kısıtlanması gereken UI elemanlarını seçin
        const approvalBtn = document.getElementById('approve-roster-btn'); // S5
        const generateBtn = document.getElementById('generate-roster-btn'); // S3
        const seatAssignmentBtn = document.getElementById('seat-assignment-btn'); // S3
        const editCrewBtn = document.getElementById('edit-crew-btn'); // S3
        
        // Varsayılan kısıtlamalar (Admin/Manager dışındaki roller için)
        if (approvalBtn) approvalBtn.style.display = 'none';
        
        // Rol bazlı kurallar
        if (userRole === 'Admin' || userRole === 'CrewManager') {
            // Admin/Manager tüm kritik işlevlere sahiptir
            if (approvalBtn) approvalBtn.style.display = 'block'; 
            
        } else if (userRole === 'Pilot' || userRole === 'Cabin') {
            // Pilot/Kabin Ekibi sadece görüntüleme (S2, S6) yapabilir.
            
            // S3'teki Roster Oluşturma ve Düzenleme butonları gizlenir
            if (generateBtn) generateBtn.style.display = 'none';
            if (seatAssignmentBtn) seatAssignmentBtn.style.display = 'none';
            if (editCrewBtn) editCrewBtn.style.display = 'none';
            
            // S5 Edit ekranında ise tüm kontrolleri gizle
            const crewEditorControls = document.getElementById('crew-editor-controls');
            if(crewEditorControls) crewEditorControls.style.display = 'none';
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
            // API çağrısı mantığı burada yer alacaktır.
        });
    }

    // --- S2: FLIGHT SEARCH & SELECTION LOGIC (Screen S2) ---

    let selectedFlight = null; 
    
    // (searchFlights, handleFlightSelection, renderFlightResults, updateContextArea fonksiyonları buraya eklenecektir)

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

        // S4, S5 Buton Aksiyonları
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
        
        // ... (S3'teki tüm helper fonksiyonlar buraya eklenecektir)
    }

    // --- S4: SEAT ASSIGNMENT LOGIC (Screen S4) ---
    
    let currentRosterDraftS4 = null; 
    
    // (renderSeatGrid, renderUnassignedPassengers, handleDragStart, handleSeatDrop fonksiyonları buraya eklenecektir)

    function initializeSeatAssignment() {
        console.log('--- Initializing Screen S4 (Seat Assignment) ---');
        const autoAssignBtn = document.getElementById('auto-assign-btn');
        if (!autoAssignBtn) return; 
        
        // S4 Başlatma ve Drag & Drop Mantığı...
    }
    
    // --- S5: CREW EDIT & APPROVAL LOGIC (Screen S5) ---
    
    let currentRosterDraftS5 = null; 

    // (revalidateRoster, renderRosterTables, renderValidationStatusS5 fonksiyonları buraya eklenecektir)

    function initializeRosterEdit() {
        console.log('--- Initializing Screen S5 (Crew Edit) ---');
        
        const approvalBtn = document.getElementById('approve-roster-btn');
        if (!approvalBtn) return; 

        // S5 Başlatma ve Edit Mantığı...
        
        // Approve Roster (UC05, FR-06)
        approvalBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to approve this Roster?')) {
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

    // (renderFinalManifest ve diğer S6 helper fonksiyonları buraya eklenecektir)

    function initializeFinalManifest() {
        console.log('--- Initializing Screen S6 (Final Manifest) ---');
        
        const finalRosterString = sessionStorage.getItem('finalRosterManifest');
        if (!finalRosterString) {
            alert('No final roster found. Returning to Roster Builder.');
            window.location.href = 'roster-builder.html';
            return;
        }

        const finalRoster = JSON.parse(finalRosterString);
        // S6 Mantığı...
    }

    // --- Sayfa Yükleme Kontrolü (index.js'in en alt kısmı) ---

    document.addEventListener('DOMContentLoaded', () => {
        
        // GÖREV 15: Her sayfa yüklendiğinde kısıtlamaları uygulayın
        applyRoleRestrictions(); 
        
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
});
// SkyRoster AI – Frontend logic with validation + alert mechanisms

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and demo data ---
    const ALERT_ICONS = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '⛔'
    };

    const demoFlights = [
        {
            flightNo: 'TK1938',
            dateTime: '2025-02-12T09:30:00Z',
            duration: '3h 20m',
            distanceKm: 2450,
            origin: 'IST',
            destination: 'AMS',
            vehicleType: 'A321',
            sharedFlight: false
        },
        {
            flightNo: 'TK421',
            dateTime: '2025-02-12T12:15:00Z',
            duration: '1h 10m',
            distanceKm: 450,
            origin: 'IST',
            destination: 'ATH',
            vehicleType: 'A320',
            sharedFlight: true
        },
        {
            flightNo: 'TK902',
            dateTime: '2025-02-13T06:45:00Z',
            duration: '6h 05m',
            distanceKm: 4200,
            origin: 'IST',
            destination: 'DXB',
            vehicleType: 'A321XLR',
            sharedFlight: false
        }
    ];

    // --- Global helpers ---
    let selectedFlight = null;
    let currentRoster = null;

    function confirmAction(title, message, onConfirm, onCancel) {
        const accepted = window.confirm(`${title}\n\n${message}`);
        if (accepted) {
            onConfirm && onConfirm();
        } else {
            onCancel && onCancel();
            pushAlert('info', 'Action cancelled', 'No changes were made.');
        }
    }

    function ensureAlertStack() {
        let stack = document.getElementById('alert-stack');
        if (!stack) {
            stack = document.createElement('div');
            stack.id = 'alert-stack';
            document.body.prepend(stack);
        }
        return stack;
    }

    const alertStack = ensureAlertStack();

    function pushAlert(type = 'info', title, message, options = {}) {
        const { autoClose = true, duration = 5200 } = options;
        const alert = document.createElement('div');
        alert.className = `alert alert--${type}`;

        const icon = document.createElement('span');
        icon.className = 'alert__icon';
        icon.textContent = ALERT_ICONS[type] || ALERT_ICONS.info;

        const body = document.createElement('div');
        body.className = 'alert__body';

        const heading = document.createElement('p');
        heading.className = 'alert__title';
        heading.textContent = title || type.toUpperCase();

        const text = document.createElement('p');
        text.className = 'alert__message';
        text.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'alert__close';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', () => {
            alert.remove();
        });

        body.appendChild(heading);
        body.appendChild(text);
        alert.appendChild(icon);
        alert.appendChild(body);
        alert.appendChild(closeBtn);
        alertStack.appendChild(alert);

        if (autoClose) {
            setTimeout(() => alert.remove(), duration);
        }
    }

    function renderValidationChecklist(containerId, validations = []) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        validations.forEach(rule => {
            const row = document.createElement('p');
            row.classList.add(`status-${rule.status}`);
            row.textContent = `${rule.code}: ${rule.message}`;
            container.appendChild(row);
        });

        if (validations.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'No validation results yet.';
            container.appendChild(empty);
        }
    }

    function summarizeValidation(validations = []) {
        const hasError = validations.some(v => v.status === 'error');
        const hasWarning = validations.some(v => v.status === 'warning');
        if (hasError) return { level: 'error', message: 'Critical blocking rules detected.' };
        if (hasWarning) return { level: 'warning', message: 'Warnings present; manual review required.' };
        return { level: 'success', message: 'All rules satisfied. Ready for next step.' };
    }

    function updateValidationBanner(hostElement, validations = []) {
        if (!hostElement) return;
        const summary = summarizeValidation(validations);
        let banner = hostElement.querySelector('.validation-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'validation-banner inline-banner';
            hostElement.prepend(banner);
        }
        banner.className = `validation-banner inline-banner validation-banner--${summary.level}`;
        banner.textContent = summary.message;
    }

    function setContextHeader(flight) {
        const contextEl = document.getElementById('context-info');
        if (!contextEl || !flight) return;
        const dateStr = new Date(flight.dateTime).toLocaleString();
        contextEl.textContent = `Flight: ${flight.flightNo} • Aircraft: ${flight.vehicleType} • Date: ${dateStr}`;
    }

    function buildDemoRoster(flight) {
        const flightContext = flight || demoFlights[0];
        return {
            flight: flightContext,
            pilots: [
                { id: 'CPT001', name: 'Capt. Kaya Demir', seniority: 'Captain', licenseType: 'A320/A321' },
                { id: 'FO001', name: 'First Officer Elif Aksoy', seniority: 'First Officer', licenseType: 'A320/A321' }
            ],
            cabinCrew: [
                { id: 'CC001', name: 'Nisa Üstün', type: 'Purser', languages: ['TR', 'EN'] },
                { id: 'CC002', name: 'Cem Kara', type: 'Senior FA', languages: ['TR', 'EN', 'DE'] },
                { id: 'CC003', name: 'Mira Yıldız', type: 'FA', languages: ['TR'] }
            ],
            passengers: [
                { paxId: 'P001', name: 'Ayşe Korkmaz', seatNo: '12A', seatType: 'Economy', affiliatedPaxId: 'P002' },
                { paxId: 'P002', name: 'Mehmet Korkmaz', seatNo: '12B', seatType: 'Infant (lap)', affiliatedPaxId: 'P001' },
                { paxId: 'P003', name: 'Lucas Moreau', seatNo: '3C', seatType: 'Business', affiliatedPaxId: '' }
            ],
            unassignedPassengers: [
                { paxId: 'P010', name: 'Kemal Öz', seatType: 'Economy' }
            ],
            validations: [
                { code: 'DR-01', status: 'ok', message: 'Captain + First Officer assigned for A321.' },
                { code: 'DR-02', status: flightContext.distanceKm > 2400 ? 'warning' : 'ok', message: 'Range near limit; verify fuel plan.' },
                { code: 'DR-03', status: flightContext.destination === 'AMS' ? 'error' : 'warning', message: 'Destination requires Dutch/French coverage; only EN/TR provided.' },
                { code: 'DR-04', status: 'ok', message: 'Passenger count within aircraft capacity.' }
            ]
        };
    }

    function renderRosterSummary(roster) {
        if (!roster) return;
        setContextHeader(roster.flight);

        const pilotList = document.getElementById('flight-crew-list');
        const cabinList = document.getElementById('cabin-crew-list');
        const paxList = document.getElementById('passenger-list');
        const pilotCount = document.getElementById('pilot-count');
        const cabinCount = document.getElementById('cabin-count');
        const paxCount = document.getElementById('passenger-count');
        const warningHost = document.getElementById('roster-warnings');

        if (pilotList) {
            pilotList.innerHTML = roster.pilots.map(p => `<li>${p.name} – ${p.seniority} (${p.licenseType})</li>`).join('');
        }
        if (cabinList) {
            cabinList.innerHTML = roster.cabinCrew.map(c => `<li>${c.name} – ${c.type} [${(c.languages || []).join(', ')}]</li>`).join('');
        }
        if (paxList) {
            paxList.innerHTML = roster.passengers.map(p => `<li>${p.seatNo || 'UNASSIGNED'} • ${p.name}</li>`).join('');
        }
        if (pilotCount) pilotCount.textContent = roster.pilots.length;
        if (cabinCount) cabinCount.textContent = roster.cabinCrew.length;
        if (paxCount) paxCount.textContent = roster.passengers.length + roster.unassignedPassengers.length;

        if (warningHost) {
            const primaryRule = roster.validations.find(v => v.status === 'error') || roster.validations.find(v => v.status === 'warning');
            const message = primaryRule ? `${primaryRule.code}: ${primaryRule.message}` : 'No outstanding warnings.';
            warningHost.innerHTML = `<div class="validation-banner validation-banner--${summarizeValidation(roster.validations).level}">${message}</div>`;
        }
    }

    // --- Screen initializers ---
    function handleSuccessfulLogin(jwtToken, role) {
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userRole', role);
        pushAlert('success', 'Signed in', 'Demo token stored; redirecting to flight search.');
        window.location.href = 'flight-search.html';
    }

    function initializeLogin() {
        const loginForm = document.getElementById('login-form');
        const errorDiv = document.getElementById('error-message');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Please enter both username and password.';
                }
                pushAlert('warning', 'Eksik bilgi', 'Giriş için kullanıcı adı ve şifre gerekiyor.');
                return;
            }

            const token = `demo-${Date.now()}`;
            handleSuccessfulLogin(token, 'admin');
        });
    }

    function renderFlightResults(flights) {
        const tbody = document.querySelector('#flight-results-table tbody');
        const noResults = document.getElementById('no-results-message');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!flights.length) {
            if (noResults) noResults.style.display = 'block';
            return;
        }
        if (noResults) noResults.style.display = 'none';

        flights.forEach(flight => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${flight.flightNo}</td>
                <td>${new Date(flight.dateTime).toLocaleString()}</td>
                <td>${flight.duration}</td>
                <td>${flight.distanceKm}</td>
                <td>${flight.origin}</td>
                <td>${flight.destination}</td>
                <td>${flight.vehicleType}</td>
                <td>${flight.sharedFlight ? 'Yes' : 'No'}</td>`;
            tr.addEventListener('click', () => {
                document.querySelectorAll('#flight-results-table tbody tr').forEach(row => row.classList.remove('selected'));
                tr.classList.add('selected');
                selectedFlight = flight;
                const context = document.getElementById('selected-flight-context');
                const openBtn = document.getElementById('open-roster-btn');
                if (context) context.textContent = `Selected: ${flight.flightNo} (${flight.origin} → ${flight.destination})`;
                if (openBtn) openBtn.disabled = false;
                sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
                pushAlert('info', 'Flight selected', `${flight.flightNo} stored for roster generation.`);
            });
            tbody.appendChild(tr);
        });
    }

    function initializeFlightSearch() {
        const form = document.getElementById('flight-search-form');
        const loadingMessage = document.getElementById('loading-message');
        const openRosterBtn = document.getElementById('open-roster-btn');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const query = document.getElementById('flight-number-input').value.trim().toLowerCase();
            if (loadingMessage) loadingMessage.style.display = 'block';
            setTimeout(() => {
                const results = demoFlights.filter(f => f.flightNo.toLowerCase().includes(query));
                renderFlightResults(results);
                if (loadingMessage) loadingMessage.style.display = 'none';
                pushAlert('info', 'Search completed', `${results.length} flight(s) listed.`);
            }, 400);
        });

        if (openRosterBtn) {
            openRosterBtn.addEventListener('click', () => {
                if (!selectedFlight) {
                    pushAlert('warning', 'Select a flight', 'Please choose a flight before opening roster.');
                    return;
                }
                sessionStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
                window.location.href = 'roster-builder.html';
            });
        }

        renderFlightResults(demoFlights);
    }

    function initializeRosterBuilder() {
        const generateBtn = document.getElementById('generate-roster-btn');
        if (!generateBtn) return;

        const draftStatus = document.getElementById('last-generation-status');
        const seatBtn = document.getElementById('seat-assignment-btn');
        const editBtn = document.getElementById('edit-crew-btn');
        const saveBtn = document.getElementById('save-export-btn');
        const discardBtn = document.getElementById('discard-draft-btn');
        const banner = document.getElementById('rule-checklist');

        const storedFlight = sessionStorage.getItem('selectedFlight');
        selectedFlight = storedFlight ? JSON.parse(storedFlight) : demoFlights[0];
        setContextHeader(selectedFlight);

        generateBtn.addEventListener('click', () => {
            confirmAction(
                'Generate new roster draft?',
                'Existing draft (if any) will be replaced with a fresh auto-merge.',
                () => {
                    currentRoster = buildDemoRoster(selectedFlight);
                    renderRosterSummary(currentRoster);
                    renderValidationChecklist('rule-checklist', currentRoster.validations);
                    updateValidationBanner(document.getElementById('rule-checklist'), currentRoster.validations);
                    sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster));

                    if (seatBtn) seatBtn.disabled = false;
                    if (editBtn) editBtn.disabled = false;
                    if (saveBtn) saveBtn.disabled = false;
                    if (draftStatus) draftStatus.textContent = `Last Draft: ${new Date().toLocaleTimeString()}`;

                    const summary = summarizeValidation(currentRoster.validations);
                    pushAlert(summary.level === 'error' ? 'error' : summary.level, 'Validation updated', summary.message);
                }
            );
        });

        if (seatBtn) {
            seatBtn.addEventListener('click', () => {
                if (currentRoster) {
                    sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster));
                }
                window.location.href = 'seat-assignment.html';
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                if (currentRoster) {
                    sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster));
                }
                window.location.href = 'extended-roster.html';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (!currentRoster) {
                    pushAlert('warning', 'No draft', 'Generate a roster before exporting.');
                    return;
                }
                pushAlert('success', 'Draft exported', 'Roster JSON saved locally (demo simulation).');
            });
        }

        if (discardBtn) {
            discardBtn.addEventListener('click', () => {
                confirmAction(
                    'Discard current draft?',
                    'This will clear the roster draft from your session storage.',
                    () => {
                        currentRoster = null;
                        sessionStorage.removeItem('currentRosterDraft');
                        pushAlert('warning', 'Draft discarded', 'Roster draft cleared from session.');
                        if (banner) banner.innerHTML = '<p class="status-warning">Awaiting roster generation.</p>';
                    }
                );
            });
        }
    }

    function renderSeatGrid(roster) {
        const seatGrid = document.getElementById('seat-grid');
        const capacityStatus = document.getElementById('capacity-status');
        const unassignedCountEl = document.getElementById('unassigned-count');
        const unassignedList = document.getElementById('unassigned-list');
        if (!seatGrid) return;

        const rows = 6;
        const seatsPerSide = ['A', 'B', 'C', 'D', 'E', 'F'];
        const occupiedMap = new Map();
        (roster.passengers || []).forEach(p => {
            if (p.seatNo) occupiedMap.set(p.seatNo, p);
        });

        seatGrid.innerHTML = '';
        for (let row = 1; row <= rows; row++) {
            seatsPerSide.forEach(letter => {
                if (letter === 'D') {
                    const aisle = document.createElement('div');
                    aisle.className = 'seat-item aisle';
                    seatGrid.appendChild(aisle);
                }
                const seatId = `${row}${letter}`;
                const seat = document.createElement('div');
                seat.className = 'seat-item';
                seat.textContent = seatId;
                if (occupiedMap.has(seatId)) {
                    seat.classList.add('occupied');
                    seat.title = occupiedMap.get(seatId).name;
                }
                seatGrid.appendChild(seat);
            });
        }

        if (unassignedList) {
            unassignedList.innerHTML = '';
            (roster.unassignedPassengers || []).forEach(p => {
                const li = document.createElement('li');
                li.dataset.class = p.seatType || 'Economy';
                li.textContent = `${p.name} (${p.seatType || 'Economy'})`;
                unassignedList.appendChild(li);
            });
        }

        if (unassignedCountEl) unassignedCountEl.textContent = (roster.unassignedPassengers || []).length;

        const totalSeats = rows * seatsPerSide.length;
        const occupied = occupiedMap.size;
        if (capacityStatus) capacityStatus.textContent = `Capacity: ${occupied}/${totalSeats}`;

        const summary = summarizeValidation(roster.validations);
        pushAlert(summary.level === 'success' ? 'success' : summary.level, 'Seat map prepared', `${occupied} seats occupied, ${totalSeats - occupied} open.`);
        if ((roster.unassignedPassengers || []).length) {
            pushAlert('warning', 'Unassigned passengers', 'At least one passenger still needs a seat.');
        }
    }

    function initializeSeatAssignment() {
        const autoAssignBtn = document.getElementById('auto-assign-btn');
        if (!autoAssignBtn) return;

        const rosterDraftString = sessionStorage.getItem('currentRosterDraft');
        currentRoster = rosterDraftString ? JSON.parse(rosterDraftString) : buildDemoRoster(selectedFlight);
        currentRoster.unassignedPassengers = currentRoster.unassignedPassengers || [];
        setContextHeader(currentRoster.flight);
        renderSeatGrid(currentRoster);

        autoAssignBtn.addEventListener('click', () => {
            if (currentRoster.unassignedPassengers.length === 0) {
                pushAlert('info', 'No action needed', 'Everyone already has a seat.');
                return;
            }
            confirmAction(
                'Auto-assign next passenger?',
                'The first unassigned passenger will be seated automatically.',
                () => {
                    const nextSeat = '5E';
                    const pax = currentRoster.unassignedPassengers.shift();
                    pax.seatNo = nextSeat;
                    currentRoster.passengers.push(pax);
                    renderSeatGrid(currentRoster);
                    sessionStorage.setItem('currentRosterDraft', JSON.stringify(currentRoster));
                    pushAlert('success', 'Auto-assign complete', `${pax.name} placed at ${nextSeat}.`);
                }
            );
        });
    }

    function renderRosterTables(roster) {
        const pilotTableBody = document.querySelector('#pilot-roster-table tbody');
        const cabinTableBody = document.querySelector('#cabin-roster-table tbody');
        if (pilotTableBody) {
            pilotTableBody.innerHTML = roster.pilots.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.seniority}</td>
                    <td>${p.licenseType}</td>
                    <td><button class="action-btn" data-id="${p.id}">Remove</button></td>
                </tr>`).join('');
        }
        if (cabinTableBody) {
            cabinTableBody.innerHTML = roster.cabinCrew.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.type}</td>
                    <td>${(c.languages || []).join(', ')}</td>
                    <td><button class="action-btn" data-id="${c.id}">Remove</button></td>
                </tr>`).join('');
        }
    }

    function initializeRosterEdit() {
        const approvalBtn = document.getElementById('approve-roster-btn');
        const revalidateBtn = document.getElementById('re-validate-btn');
        if (!approvalBtn || !revalidateBtn) return;

        const rosterDraftString = sessionStorage.getItem('currentRosterDraft');
        if (!rosterDraftString) {
            pushAlert('warning', 'Missing draft', 'Generate a roster first. Redirecting...');
            window.location.href = 'roster-builder.html';
            return;
        }

        currentRoster = JSON.parse(rosterDraftString);
        setContextHeader(currentRoster.flight);
        renderRosterTables(currentRoster);
        renderValidationChecklist('s5-rule-checklist', currentRoster.validations);

        const summary = summarizeValidation(currentRoster.validations);
        approvalBtn.disabled = summary.level !== 'success';
        const approvalMessage = document.getElementById('approval-message');
        if (approvalMessage) {
            approvalMessage.textContent = summary.level === 'success'
                ? 'Roster is compliant. You can approve and publish.'
                : 'Resolve warnings/errors before approval.';
        }

        revalidateBtn.addEventListener('click', () => {
            pushAlert('info', 'Validating', 'Running rule set against latest roster draft...');
            setTimeout(() => {
                renderValidationChecklist('s5-rule-checklist', currentRoster.validations);
                const state = summarizeValidation(currentRoster.validations);
                approvalBtn.disabled = state.level !== 'success';
                pushAlert(state.level === 'success' ? 'success' : state.level, 'Validation finished', state.message);
            }, 500);
        });

        approvalBtn.addEventListener('click', async () => {
            confirmAction(
                'Approve roster?',
                'Approval will lock the roster and publish the manifest.',
                () => {
                    pushAlert('success', 'Roster approved', 'Draft locked and sent to manifest.');
                    sessionStorage.setItem('finalRosterManifest', JSON.stringify(currentRoster));
                    window.location.href = 'final-manifest.html';
                }
            );
        });
    }

    function renderFinalManifest(finalRoster) {
        const flightContext = finalRoster.flight || {};

        const summaryHost = document.getElementById('flight-context-header');
        if (summaryHost) {
            const p = summaryHost.querySelector('p');
            if (p) p.textContent = `Flight: ${flightContext.flightNo} • Aircraft: ${flightContext.vehicleType} • Roster Status: APPROVED`;
        }

        document.getElementById('s6-flight-no').textContent = flightContext.flightNo || 'N/A';
        document.getElementById('s6-date-time').textContent = new Date(flightContext.dateTime).toLocaleString();
        document.getElementById('s6-aircraft').textContent = flightContext.vehicleType || 'N/A';
        document.getElementById('s6-pax-count').textContent = finalRoster.passengers.length;
        document.getElementById('pilot-manifest-list').innerHTML = finalRoster.pilots.map(p => `<li>${p.name} - ${p.seniority} (${p.licenseType})</li>`).join('');
        document.getElementById('cabin-manifest-list').innerHTML = finalRoster.cabinCrew.map(c => `<li>${c.name} - ${c.type} (${(c.languages || []).join(', ') || 'N/A'})</li>`).join('');

        const paxTableBody = document.querySelector('#pax-manifest-table tbody');
        paxTableBody.innerHTML = '';
        const sortedPassengers = [...finalRoster.passengers].sort((a, b) => (a.seatNo || '').localeCompare(b.seatNo || ''));
        sortedPassengers.forEach(p => {
            const row = paxTableBody.insertRow();
            row.innerHTML = `
                <td>${p.seatNo || 'UNASSIGNED'}</td>
                <td>${p.name}</td>
                <td>${p.seatType || 'N/A'}</td>
                <td>${p.affiliatedPaxId || 'None'}</td>`;
        });
    }

    function initializeFinalManifest() {
        const finalRosterString = sessionStorage.getItem('finalRosterManifest');
        if (!finalRosterString) {
            pushAlert('warning', 'No manifest', 'Approve a roster first. Returning to builder.');
            window.location.href = 'roster-builder.html';
            return;
        }

        const finalRoster = JSON.parse(finalRosterString);
        renderFinalManifest(finalRoster);

        const printBtn = document.getElementById('print-manifest-btn');
        const downloadBtn = document.getElementById('download-manifest-btn');
        if (printBtn) printBtn.addEventListener('click', () => pushAlert('info', 'Print', 'Print dialog opened (simulated).'));
        if (downloadBtn) downloadBtn.addEventListener('click', () => pushAlert('success', 'Download', 'Manifest CSV generated (simulated).'));
    }

    // --- Router ---
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
        initializeFinalManifest();
    } else {
        initializeLogin();
    }
});

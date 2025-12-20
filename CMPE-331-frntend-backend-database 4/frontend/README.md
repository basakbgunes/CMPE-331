# 🖥️ Frontend - SkyRoster Flight Roster System

Vanilla JavaScript SPA (Single Page Application) - Hiç framework olmadan saf JavaScript + HTML + CSS.

## 📋 İçindekiler

1. [Proje Yapısı](#proje-yapısı)
2. [Sayfalar (Screens)](#sayfalar)
3. [Geliştirme](#geliştirme)
4. [JavaScript Mimarisi](#javascript-mimarisi)
5. [Stil Sistemi](#stil-sistemi)

---

## 📁 Proje Yapısı

```
frontend/
├── public/                      # Web sunucusunun hizmet ettiği dosyalar
│   ├── index.html               # S1 - Giriş Ekranı
│   ├── flight-search.html       # S2 - Uçuş Arama
│   ├── roster-builder.html      # S3 - Roster Oluştur
│   ├── seat-assignment.html     # S4 - Koltuk Ataması
│   ├── extended-roster.html     # S5 - Ekip Onayı
│   ├── final-manifest.html      # S6 - Son Manifest
│   ├── main.js                  # Tüm sayfaların JavaScript kodu
│   └── styles/
│       ├── main.css             # SCSS'ten derlenmiş CSS
│       └── main.scss            # SCSS kaynağı
├── src/
│   ├── scripts/
│   │   └── index.js             # Yedek JavaScript (main.js'i kopyala)
│   └── styles/
│       └── main.scss            # SCSS ana dosyası
├── package.json                 # npm bağımlılıkları
└── README.md                    # Bu dosya
```

---

## 🎬 Sayfalar (6-Screen Workflow)

### S1: Giriş Ekranı (`index.html`)
**Fonksiyon:** JWT kimlik doğrulaması
- Username/Password giriş
- Backend'e POST isteği
- JWT token localStorage'a kaydedilir
- S2'ye yönlendir

**Test Kredileri:**
```
Username: admin
Password: admin123
```

### S2: Uçuş Arama (`flight-search.html`)
**Fonksiyon:** Uçuş seçimi
- `/flights` API'nden tüm uçuşları getir
- Tablo formatında göster
- Uçuş seçilince sessionStorage'a kaydet
- S3'e yönlendir

**Gösterilen Veriler:**
- Flight No (TK123, LH456 vs.)
- Tarih/Saat
- Süre (dakika)
- Mesafe (km)
- Uçak Tipi

### S3: Roster Oluştur (`roster-builder.html`)
**Fonksiyon:** Pilot ve ekip atama
- "AUTO-GENERATE ROSTER" butonuyla mock data oluştur
- Pilot listesi (Captain + First Officer)
- Cabin Crew listesi (3+ Flight Attendant)
- sessionStorage'a kaydet
- S4 (Seat Assignment) veya S5 (Edit) seçeneği

**Veriler:**
```javascript
{
  flightNumber: "TK123",
  aircraft: "Boeing 737",
  pilots: [
    { name: "Captain John Smith", certType: "CPT" },
    { name: "First Officer Jane Doe", certType: "FO" }
  ],
  cabinCrew: [
    { name: "Alice Johnson", type: "FA", language: "EN" },
    { name: "Bob Wilson", type: "FA", language: "EN" },
    { name: "Carol Davis", type: "Purser", language: "EN" }
  ],
  passengers: [
    { id: "PAX-001", name: "Passenger 1", ticketClass: "Economy" },
    { id: "PAX-002", name: "Passenger 2", ticketClass: "Economy" },
    { id: "PAX-003", name: "Passenger 3", ticketClass: "Economy" }
  ]
}
```

### S4: Koltuk Ataması (`seat-assignment.html`)
**Fonksiyon:** Yolcuları koltuklara ata
- Koltuk grid'ini göster (6 sütun)
- "AUTO-ASSIGN SEATS" butonuyla A1, A2, A3'e ata
- Atanan koltukları yeşille
- sessionStorage'a kaydet
- S3'e geri dön

**Koltuk Formatı:**
```
A1 A2 A3 A4 A5 A6
B1 B2 B3 B4 B5 B6
C1 C2 C3 C4 C5 C6
...
```

### S5: Ekip Onayı (`extended-roster.html`)
**Fonksiyon:** Roster'ı gözden geçir ve onayla
- Pilot tablosu
- Cabin Crew tablosu
- Yolcu manifest tablosu (koltuk atamaları ile)
- "APPROVE & PROCEED TO MANIFEST" butonuyla S6'ya git
- Status "APPROVED" olur
- Onay timestamps kaydedilir

### S6: Son Manifest (`final-manifest.html`)
**Fonksiyon:** Son manifest göster
- Uçuş detayları
- Pilot manifest (title + isim)
- Cabin Crew manifest
- Yolcu tablosu (koltuk, isim, sınıf, ID)
- "Print Manifest (PDF)" - window.print()
- "Download Manifest (CSV)" - CSV dosya indir

---

## 🛠️ Geliştirme

### Dosyaları Düzenle

Tüm screen'ler `public/main.js` tarafından kontrol edilir. HTML dosyaları sabit kalır.

```bash
# main.js'i düzenle
nano frontend/public/main.js

# veya VS Code'ta aç
code frontend/public/main.js
```

### SCSS Stilleri Düzenle

```bash
# SCSS kaynağını düzenle
code frontend/src/styles/main.scss

# Otomatik derle (watch mode)
npm run sass

# Veya manuel:
npx sass frontend/src/styles/main.scss frontend/public/styles/main.css
```

### Yeni Fonksiyon Ekle

Tüm initialization fonksiyonları `main.js`'de:

```javascript
// Mevcut functions:
function initializeLogin()          // S1
function initializeFlightSearch()   // S2
function initializeRosterBuilder()  // S3
function initializeSeatAssignment() // S4
function initializeRosterEdit()     // S5
function initializeFinalManifest()  // S6

// Yeni eklemek için:
function initializeNewScreen() {
    console.log('--- Initializing New Screen ---');
    
    // DOM elementlerini al
    const element = document.getElementById('id');
    
    // Event listeners ekle
    element.addEventListener('click', () => {
        // İşlem yap
    });
    
    // Veri göster
    const data = sessionStorage.getItem('key');
}
```

---

## 🏗️ JavaScript Mimarisi

### Dosya: `public/main.js` (1046 satır)

#### Global Değişkenler (Satır 1-20)
```javascript
const PROVIDER_API_BASE = 'http://localhost:3000/';
const LOGIN_API_URL = PROVIDER_API_BASE + 'auth/login';
const FLIGHT_SEARCH_API_URL = PROVIDER_API_BASE + 'flights';
// ... diğer endpoints
```

#### Global Fonksiyonlar (Satır 18-40)
```javascript
let currentRosterDraftS5 = null;  // S5 router'ı için

function handleApproveClick() {
    // S5'ten S6'ya onay işlemi
}
```

#### DOMContentLoaded Event (Satır ~40)
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Sayfa yüklendiğinde çalış
    applyRoleRestrictions();      // RBAC uygula
    const page = window.location.pathname;
    
    if (page.includes('flight-search')) {
        initializeFlightSearch();
    } else if (page.includes('roster-builder')) {
        initializeRosterBuilder();
    }
    // ... diğer sayfalar
});
```

#### Helper Fonksiyonları
```javascript
function displayError(message, status) { }      // Hata göster
function applyRoleRestrictions() { }            // RBAC
```

#### Initialization Fonksiyonları (Satır ~100-950)
Her screen'in kendi init fonksiyonu:
- S1: `initializeLogin()` - JWT token al
- S2: `initializeFlightSearch()` - Uçuş tablosu
- S3: `initializeRosterBuilder()` - Mock roster
- S4: `initializeSeatAssignment()` - Grid + auto-assign
- S5: `initializeRosterEdit()` - Review + approve
- S6: `initializeFinalManifest()` - Manifest display

#### Sayfa Yükleme Mantığı (Satır ~1030)
```javascript
const currentPage = window.location.pathname.split('/').pop();

if (currentPage === 'flight-search.html') {
    initializeFlightSearch();
} else if (currentPage === 'roster-builder.html') {
    initializeRosterBuilder();
} // ... diğer sayfalar
```

### API İntegrasyonu

#### Login Flow
```javascript
const response = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
});

const data = await response.json();
localStorage.setItem('jwtToken', data.token);
localStorage.setItem('userRole', data.user.role);
window.location.href = 'flight-search.html';  // S2'ye git
```

#### Protected Requests (Token Gerekli)
```javascript
const jwtToken = localStorage.getItem('jwtToken');

const response = await fetch(FLIGHT_SEARCH_API_URL, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
    }
});
```

### State Management

**localStorage** - Persistent:
```javascript
localStorage.setItem('jwtToken', token);
localStorage.setItem('userRole', role);
const token = localStorage.getItem('jwtToken');
```

**sessionStorage** - Tab kapatılınca silinir:
```javascript
sessionStorage.setItem('selectedFlight', JSON.stringify(flight));
sessionStorage.setItem('currentRosterDraft', JSON.stringify(roster));
sessionStorage.setItem('finalRosterManifest', JSON.stringify(approved));
```

---

## 🎨 Stil Sistemi

### SCSS Yapısı (`src/styles/main.scss`)

```scss
// 1. CSS Variables
$primary-color: #3498db;
$error-color: #e74c3c;
$font-stack: Arial, sans-serif;

// 2. Global Styles
* { margin: 0; padding: 0; }
body { font-family: $font-stack; }

// 3. Component Styles
.form-group { ... }
.button { ... }
.table { ... }

// 4. Screen-Specific
.login-screen { ... }
.flight-search-screen { ... }
.seat-grid { display: grid; grid-template-columns: repeat(6, 1fr); }

// 5. RBAC Styles
[data-role="pilot"] .generate-btn { display: none; }
```

### Önemli CSS Sınıfları

| Sınıf | Amaç |
|-------|------|
| `.seat-grid` | Koltuk grid layout'u |
| `.seat-item` | Tekil koltuk |
| `.seat-item.assigned` | Atanmış koltuk (yeşil) |
| `.error-message` | Hata mesajı göster |
| `.button` | Standart buton |
| `.button:disabled` | Devre dışı buton |
| `.table` | Veri tablosu |

---

## 📊 Error Handling

Tüm hata mesajları HTML'de `#error-message` div'ine yazılır:

```javascript
function displayError(message, status = null) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = status ? `[${status}] ${message}` : message;
        errorDiv.style.display = 'block';
        console.error(message);
    }
}
```

Kullanım:
```javascript
try {
    const response = await fetch(url);
    if (!response.ok) {
        displayError('Uçuş yüklenemedi', response.status);
    }
} catch (error) {
    displayError(error.message);
}
```

---

## 🔐 Role-Based Access Control (RBAC)

### Roller

| Role | Erişim |
|------|--------|
| **Admin** | Tüm sayfalar + tüm butonlar |
| **CrewManager** | Tüm sayfalar + tüm butonlar |
| **Pilot** | S2 (Flights), S6 (Manifest) oku |
| **Cabin** | S2 (Flights), S6 (Manifest) oku |

### Implementation

```javascript
function applyRoleRestrictions() {
    const role = localStorage.getItem('userRole');
    const restrictedActions = {
        'generate-roster-btn': ['Admin', 'CrewManager'],
        'seat-assignment-btn': ['Admin', 'CrewManager'],
        'edit-crew-btn': ['Admin', 'CrewManager'],
        'approve-roster-btn': ['Admin', 'CrewManager']
    };
    
    Object.entries(restrictedActions).forEach(([btnId, allowedRoles]) => {
        const btn = document.getElementById(btnId);
        if (btn && !allowedRoles.includes(role)) {
            btn.style.display = 'none';
        }
    });
}
```

---

## 🧪 Testing

Manual Test Akışı:

1. **S1 Login:** admin/admin123
2. **S2 Flights:** TK123 seç
3. **S3 Roster:** AUTO-GENERATE tıkla
4. **S4 Seats:** AUTO-ASSIGN tıkla (A1, A2, A3 yeşil)
5. **S5 Approve:** APPROVE tıkla
6. **S6 Manifest:** Print & Download test et

---

## 📝 Coding Conventions

### Dosya İsimleri
- HTML: `kebab-case.html` (seat-assignment.html)
- JavaScript: `camelCase` (initializeFlightSearch)
- CSS Classes: `kebab-case` (.seat-grid)
- Variables: `camelCase` (currentRoster)

### Yorum Yazma
```javascript
// Kısa açıklama
const roster = {};

/**
 * Fonksiyon açıklaması
 * @param {string} name - Parametrenin açıklaması
 * @returns {boolean} Dönüş değerinin açıklaması
 */
function exampleFunction(name) {
    return true;
}
```

### Event Listeners
```javascript
const btn = document.getElementById('my-button');
if (btn) {
    btn.addEventListener('click', () => {
        // Arrow function kullan
    });
}
```

---

## 🚀 Production Build

Frontend statik dosya olduğundan herhangi bir build gerekli değildir. Dosyaları doğrudan sun:

```bash
# Development
npx http-server frontend/public -p 5501

# Production (nginx, apache vb.)
# frontend/public dosyasını server'a deploy et
```

---

**Son Güncelleme:** 18 Aralık 2025

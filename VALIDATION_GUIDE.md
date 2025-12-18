# 🎯 Doğrulama ve Uyarı Mekanizması - Entegrasyon Rehberi

## 📋 İçindekiler
1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Bileşenler](#bileşenler)
3. [Kullanım Örnekleri](#kullanım-örnekleri)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Entegrasyonu](#frontend-entegrasyonu)
6. [Hata Kodları](#hata-kodları)

---

## Sistem Genel Bakış

Proje için tamamlanmış bir doğrulama ve uyarı mekanizması kurulmuştur. Bu sistem şunları içerir:

✅ **Backend Doğrulama** (Node.js/Express)
- Yolcu veri doğrulaması
- Ekip bileşimi kontrolü
- Koltuk atama doğrulaması
- Uçak kapasitesi kontrolleri

✅ **Frontend Uyarı Sistemi** (JavaScript)
- Renkli alert göstergeleri
- Gerçek zamanlı form doğrulaması
- Toast bildirimler
- Doğrulama özeti paneli

✅ **CSS/SCSS Stilleri**
- Hata, uyarı, bilgi ve başarı alert stilleri
- Form field doğrulama göstergeleri
- Responsive tasarım

---

## Bileşenler

### 1. AlertManager (Frontend)
Uyarıları yönetir ve görüntüler.

```javascript
const alertManager = new AlertManager();

// Alert ekleme
alertManager.addAlert({
    code: "PAX-001",
    message: "Yolcu ID boş olamaz",
    level: "error",  // error | warning | info | success
    entityType: "passenger",
    entityId: "PAX-123",
    suggestion: "Geçerli bir PAX ID girin"
});

// Tüm alertleri temizle
alertManager.clearAlerts();

// Özet al
const summary = alertManager.getSummary();
// { total: 5, errors: 2, warnings: 2, info: 1 }
```

### 2. FormValidator (Frontend)
Form alanlarında doğrulama kuralları tanımlar.

```javascript
const formValidator = new FormValidator();

// Kurallar ekle
formValidator.addFieldRules("email", [
    {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Geçerli bir email girin"
    }
]);

// Form doğrulaması
const isValid = formValidator.validateForm({
    email: "user@example.com"
});
```

### 3. PassengerValidator (Frontend)
Yolcu verisi doğrulama metodları.

```javascript
// Tekil doğrulama
PassengerValidator.validatePaxId("PAX-123"); // true/false
PassengerValidator.validateAge(28); // true/false
PassengerValidator.validateType("adult"); // true/false

// Tam yolcu doğrulaması
const alerts = PassengerValidator.validatePassenger({
    paxId: "P-001",
    fullName: "Ali Yıldız",
    age: 28,
    type: "adult"
});
```

### 4. APIValidator (Frontend)
Backend API'si ile iletişim kurar.

```javascript
const apiValidator = new APIValidator("http://localhost:5004");

// Yolcu doğrulaması (API)
const result = await apiValidator.validatePassenger({
    paxId: "P-001",
    fullName: "Ali Yıldız",
    age: 28,
    type: "adult"
});

// Roster doğrulaması (API)
const rosterResult = await apiValidator.validateRoster(rosterData);
```

---

## Kullanım Örnekleri

### Örnek 1: Basit Alert Gösterme

```javascript
// HTML'de alert container'ı bulunmalıdır
// <div id="alerts-container" class="alerts-container"></div>

// Script'te
const alertManager = new AlertManager();

alertManager.addAlert({
    code: "EXAMPLE-001",
    message: "Bu bir örnek hatadır",
    level: "error",
    entityType: "test"
});
```

### Örnek 2: Yolcu Formunu Doğrulama

```html
<form id="passenger-form">
    <input type="text" id="pax-id" placeholder="PAX ID">
    <input type="text" id="full-name" placeholder="Ad Soyad">
    <input type="number" id="age" placeholder="Yaş">
    <select id="pax-type">
        <option value="adult">Yetişkin</option>
        <option value="child">Çocuk</option>
        <option value="infant">Bebek</option>
    </select>
    <button type="submit">Kaydet</button>
</form>

<script>
document.getElementById("passenger-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const passenger = {
        paxId: document.getElementById("pax-id").value,
        fullName: document.getElementById("full-name").value,
        age: parseInt(document.getElementById("age").value),
        type: document.getElementById("pax-type").value
    };

    // Yerel doğrulama
    const localAlerts = PassengerValidator.validatePassenger(passenger);
    
    // API doğrulaması
    const apiResult = await window.apiValidator.validatePassenger(passenger);

    // Tüm alertleri göster
    [...localAlerts, ...apiResult.alerts].forEach(alert => {
        window.alertManager.addAlert(alert);
    });

    if (apiResult.isValid && localAlerts.filter(a => a.level === "error").length === 0) {
        // Yolcuyu kaydet
        console.log("Yolcu başarıyla kaydedildi");
    }
});
</script>
```

### Örnek 3: Roster Doğrulaması

```javascript
async function validateAndDisplayRoster(rosterData) {
    try {
        // API'ye gönder
        const result = await window.apiValidator.validateRoster(rosterData);

        // Alertleri göster
        result.alerts.forEach(alert => {
            window.alertManager.addAlert(alert);
        });

        // Özet göster
        console.log("Doğrulama Özeti:", result.summary);
        
        if (result.isValid) {
            window.alertManager.addAlert({
                code: "SUCCESS",
                message: "Roster başarıyla doğrulandı",
                level: "success",
                entityType: "roster"
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Hata:", error);
        return false;
    }
}
```

---

## Backend API Endpoints

### 1. POST /api/validate/passenger

Tekil yolcu doğrulaması.

**Request:**
```json
{
    "paxId": "P-001",
    "fullName": "Ali Yıldız",
    "age": 28,
    "type": "adult"
}
```

**Response:**
```json
{
    "isValid": true,
    "alerts": [
        {
            "code": "PAX-001",
            "message": "Yolcu ID boş olamaz",
            "level": "error",
            "entityType": "passenger",
            "entityId": "P-001"
        }
    ]
}
```

---

### 2. POST /api/validate/roster

Tüm roster doğrulaması.

**Request:**
```json
{
    "flightId": "AA1243",
    "aircraft": { "type": "Boeing777" },
    "pilots": [...],
    "cabinCrew": [...],
    "passengers": [...]
}
```

**Response:**
```json
{
    "isValid": false,
    "summary": {
        "totalAlerts": 5,
        "errors": 2,
        "warnings": 3
    },
    "alerts": [...],
    "timestamp": "2025-12-18T10:30:00.000Z"
}
```

---

### 3. POST /api/validate/passengers

Batch yolcu doğrulaması.

**Request:**
```json
{
    "passengers": [
        { "paxId": "P-001", "fullName": "Ali Yıldız", "age": 28, "type": "adult" },
        { "paxId": "P-002", "fullName": "Ayşe Kaya", "age": 5, "type": "child" }
    ]
}
```

**Response:**
```json
{
    "isValid": true,
    "totalValidated": 2,
    "validCount": 2,
    "results": [
        {
            "paxId": "P-001",
            "isValid": true,
            "alerts": []
        },
        ...
    ]
}
```

---

## Frontend Entegrasyonu

### 1. HTML Dosyalarına Ekleme

Her HTML dosyasının `<body>` başında alert container'ını ekleyin:

```html
<body>
    <!-- Alert Container -->
    <div id="alerts-container" class="alerts-container"></div>
    
    <header>...</header>
    <main>...</main>
    
    <!-- Scripts -->
    <script src="../src/scripts/validation.js"></script>
    <script src="index.js"></script>
</body>
```

✅ **Zaten eklenmiş olan dosyalar:**
- public/index.html
- public/flight-search.html
- public/roster-builder.html
- public/seat-assignment.html
- public/extended-roster.html
- public/final-manifest.html

### 2. CSS Dosyasında

SCSS stilleri zaten `src/styles/main.scss`'e eklenmiştir. Derleme:

```bash
# SCSS'i CSS'e derle
npm run build-css
# veya
sass src/styles/main.scss public/styles/main.css
```

### 3. Script Dosyasında

Doğrulama metodlarını kullanın:

```javascript
// Demo fonksiyonları
<script src="../src/scripts/validation-demo.js"></script>

<script>
    // Örnek: Alertleri göster
    ValidationDemo.showBasicAlerts();

    // Örnek: Roster doğrula
    await ValidationDemo.validateCompleteRoster();
</script>
```

---

## Hata Kodları

### Yolcu Hataları (PAX-xxx)

| Kod | Mesaj | Seviye | Çözüm |
|-----|-------|--------|-------|
| PAX-001 | Yolcu ID boş olamaz | ERROR | Geçerli PAX ID girin |
| PAX-002 | Yolcu adı boş olamaz | ERROR | Ad ve soyadı girin |
| PAX-003 | Yaş bilgisi eksik | ERROR | Yaş bilgisini girin |
| PAX-004 | Yaş geçerli bir sayı değil | ERROR | Yaş için sayı girin |
| PAX-005 | Yaş negatif olamaz | ERROR | Pozitif yaş değeri girin |
| PAX-006 | Yaş değeri gerçekçi değil | WARNING | Yaş değerini kontrol edin |
| PAX-008 | Yolcu tipi geçersiz | ERROR | Geçerli tip seçin (adult, child, infant) |

### Ekip Hataları (CREW-xxx)

| Kod | Mesaj | Seviye | Çözüm |
|-----|-------|--------|-------|
| CREW-001 | Ekip ID'si boş olamaz | ERROR | Geçerli CREW ID girin |
| CREW-002 | Ekip adı ve soyadı gerekli | ERROR | Ad ve soyadı girin |
| CREW-003 | Ekip rolü belirtilmeli | ERROR | Rol seçin |
| CREW-004 | Kabin görevlisinin dil bilemesi gerekir | WARNING | Dil bilgisi ekleyin |

### Roster Hataları (DR-xxx, SEAT-xxx, CAPACITY-xxx)

| Kod | Mesaj | Seviye | Çözüm |
|-----|-------|--------|-------|
| DR-01 | En az 2 pilot gerekli | ERROR | Pilot ekleyin |
| DR-01-SENIOR | En az 1 senior pilot gerekli | ERROR | Senior pilot ekleyin |
| DR-03 | Kabin görevlisi sayısı yetersiz | WARNING | Kabin görevlisi ekleyin |
| SEAT-001 | Koltuk ataması yapılmamış | WARNING | Tüm yolculara koltuk atayın |
| SEAT-002 | Aynı koltuk birden fazla atanmış | ERROR | Koltuk çakışmalarını düzeltin |
| CAPACITY-001 | Uçak kapasitesi aşılmış | ERROR | Personel sayısını azaltın |

---

## 🧪 Test Etme

### Node.js Terminal'de Test:

```bash
# Sunucuyu başlat
node app.js

# Yeni terminal'de test et
curl -X POST http://localhost:5004/api/validate/passenger \
  -H "Content-Type: application/json" \
  -d '{"paxId":"P-001","fullName":"Ali Yıldız","age":28,"type":"adult"}'
```

### Browser Console'da Test:

```javascript
// Alertleri göster
ValidationDemo.showBasicAlerts();

// Özet al
ValidationDemo.getAlertSummary();

// API ile doğrula
await ValidationDemo.validatePassengerViaAPI();

// Batch doğrula
await ValidationDemo.validateMultiplePassengers();
```

---

## 📊 Alert Türleri

### 1. **Error** (Kırmızı - #e74c3c)
- Sistem devam etmemesi gereken ciddi sorunlar
- Ör: Eksik zorunlu alan, geçersiz veri

### 2. **Warning** (Turuncu - #f39c12)
- Dikkat gerektiren durumlar
- Ör: Gerçek dışı yaş değeri, eksik dil bilgisi

### 3. **Info** (Mavi - #3498db)
- Bilgilendirme mesajları
- Ör: İşlem tamamlandı, kontrol yapılıyor

### 4. **Success** (Yeşil - #27ae60)
- Başarılı operasyonlar
- Ör: Roster doğrulandı, kayıt tamamlandı

---

## 📝 Notlar

- ✅ Validation sistemi **Turkish** ve **English** mesajları destekler
- ✅ Tüm alerts **XSS koruması** (HTML escape) içerir
- ✅ API endpoints **CORS enabled** (cross-origin requests)
- ✅ Frontend ve backend doğrulama **senkronize** edilmiş
- ✅ Alertler **otomatik olarak kapat** edilebilir veya manuel kapatılabilir

---

## 🔧 Geliştirme

Yeni doğrulama kuralı eklemek için:

### Backend (app.js):
```javascript
// POST /api/validate/passenger endpoint'inde
alerts.push({
    code: "PAX-009",
    message: "Yeni doğrulama kuralı",
    level: "warning",
    entityType: "passenger",
    suggestion: "Çözüm önerisi"
});
```

### Frontend (validation.js):
```javascript
// PassengerValidator sınıfında
static validateNewRule(value) {
    return value && value.length > 0;
}
```

---

## ✨ Özellikler

- 🎨 Renk kodlu alertler (Error, Warning, Info, Success)
- 📝 Detaylı hata mesajları
- 💡 Öneriler ve ipuçları
- ⏱️ Otomatik alert kapatma
- 🔄 Batch doğrulama
- 📊 Doğrulama özeti
- 🎯 Form field doğrulaması
- 🌐 API entegrasyonu
- 🔒 XSS koruması
- 📱 Responsive tasarım

---

Daha fazla bilgi veya özel doğrulama kuralları için lütfen iletişime geçin! 🚀

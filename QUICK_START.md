# ⚡ Doğrulama Sistemi - Hızlı Başlangıç

## 🎯 Sistem Nedir?

Flight Roster Management System'a tam entegre edilmiş **doğrulama ve uyarı mekanizması** eklenmiştir.

### ✨ Yeni Özellikler:

✅ **Backend Validation Endpoints**
- `/api/validate/passenger` - Yolcu doğrulaması
- `/api/validate/roster` - Roster doğrulaması  
- `/api/validate/passengers` - Batch yolcu doğrulaması

✅ **Frontend Alert System**
- Renkli, anlaşılır alert mesajları
- Türkçe ve İngilizce desteği
- Hata, uyarı, bilgi, başarı bildirimleri

✅ **Form Validation**
- Gerçek zamanlı form doğrulaması
- İnline hata mesajları
- Kural-tabanlı validation

---

## 🚀 Kullanmaya Başlama

### 1. HTML'de

Her HTML dosyasında (zaten eklendi):

```html
<body>
    <!-- Alert Container -->
    <div id="alerts-container" class="alerts-container"></div>
    
    <!-- ... -->
    
    <script src="../src/scripts/validation.js"></script>
</body>
```

### 2. JavaScript'te

```javascript
// Global alert manager
window.alertManager.addAlert({
    code: "EXAMPLE-001",
    message: "Bu bir uyarı mesajıdır",
    level: "warning",  // error, warning, info, success
    entityType: "passenger",
    entityId: "P-001",
    suggestion: "Bu işlemi yapmalısınız"
});
```

### 3. Yolcu Doğrulaması

```javascript
// Basit doğrulama
const alerts = PassengerValidator.validatePassenger({
    paxId: "P-001",
    fullName: "Ali Yıldız",
    age: 28,
    type: "adult"
});

// API ile doğrulama
const result = await window.apiValidator.validatePassenger({
    paxId: "P-001",
    fullName: "Ali Yıldız",
    age: 28,
    type: "adult"
});

console.log(result.isValid); // true/false
```

### 4. Roster Doğrulaması

```javascript
const result = await window.apiValidator.validateRoster({
    flightId: "AA1243",
    aircraft: { type: "Boeing777" },
    pilots: [...],
    cabinCrew: [...],
    passengers: [...]
});

// Alertleri göster
result.alerts.forEach(alert => {
    window.alertManager.addAlert(alert);
});
```

---

## 📦 Kurulu Dosyalar

### Backend (Node.js)
- **app.js** - Validation endpoints eklenmiş

### Frontend (JavaScript)
- **src/scripts/validation.js** - Ana validation sistemi
- **src/scripts/validation-demo.js** - Örnek fonksiyonlar

### Styles (SCSS/CSS)
- **src/styles/main.scss** - Alert stilleri eklenmemiş

### HTML (Güncellenmemiş)
- **public/index.html** ✅
- **public/flight-search.html** ✅
- **public/roster-builder.html** ✅
- **public/seat-assignment.html** ✅
- **public/extended-roster.html** ✅
- **public/final-manifest.html** ✅

---

## 🎨 Alert Görünümü

```
┌─────────────────────────────────────┐
│ ❌ PAX-001 Yolcu ID boş olamaz  [×] │
│ Etkilenen: P-001                    │
│ 💡 Geçerli bir PAX ID girin        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️  DR-03 Kabin görevlisi az    [×] │
│ 💡 En az 3 kabin görevlisi ekleyin │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ SUCCESS-001 Roster doğrulandı [×]│
└─────────────────────────────────────┘
```

---

## 📋 Hata Kodları (Önemli)

| Kod | Anlamı | Seviye |
|-----|--------|--------|
| PAX-001 | Yolcu ID boş | ERROR ❌ |
| PAX-003 | Yaş eksik | ERROR ❌ |
| DR-01 | En az 2 pilot gerekli | ERROR ❌ |
| DR-03 | Kabin görevlisi az | WARNING ⚠️ |
| SEAT-001 | Koltuk ataması eksik | WARNING ⚠️ |
| CAPACITY-001 | Kapasite aşıldı | ERROR ❌ |

👉 **Tüm kodlar için:** [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md)

---

## 🧪 Test Etme

### Test 1: Alert Göstermek

```javascript
// Browser console'da çalıştırın
window.alertManager.addAlert({
    code: "TEST-001",
    message: "Test uyarısı",
    level: "info",
    entityType: "test"
});
```

### Test 2: Yolcu Doğrulaması

```javascript
// validation-demo.js yüklenmiş ise:
await ValidationDemo.validatePassengerViaAPI();
```

### Test 3: Batch Doğrulama

```javascript
await ValidationDemo.validateMultiplePassengers();
```

### Test 4: Roster Doğrulaması

```javascript
await ValidationDemo.validateCompleteRoster();
```

---

## 🔧 Özel Entegrasyon

### Formu Doğrulamak

```javascript
document.getElementById("passenger-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const passenger = {
        paxId: document.getElementById("pax-id").value,
        fullName: document.getElementById("full-name").value,
        age: parseInt(document.getElementById("age").value),
        type: document.getElementById("pax-type").value
    };

    // Doğrula
    const result = await window.apiValidator.validatePassenger(passenger);

    // Alertleri göster
    result.alerts.forEach(alert => {
        window.alertManager.addAlert(alert);
    });

    // Kaydet (eğer valid ise)
    if (result.isValid) {
        // Yolcuyu kaydet
    }
});
```

### Hazır Fonksiyonlar

```javascript
// validation-demo.js'den

ValidationDemo.showBasicAlerts();          // Örnek alertler göster
ValidationDemo.validateCompleteRoster();   // Roster doğrula
ValidationDemo.clearAllAlerts();          // Tüm alertleri temizle
ValidationDemo.getAlertSummary();         // Özet al
```

---

## 📊 API Endpoints

### POST /api/validate/passenger
Yolcu doğrulaması

### POST /api/validate/roster
Roster doğrulaması

### POST /api/validate/passengers
Batch yolcu doğrulaması

---

## ⚙️ Kurulum

```bash
# Backend sunucusu başlat
node app.js

# Frontend açmak için
open public/index.html
# veya
firefox public/index.html
```

---

## 🎓 Şimdi Öğrenmek İçin

1. **VALIDATION_GUIDE.md** - Detaylı dokumentasyon
2. **src/scripts/validation.js** - Kaynak kodu
3. **src/scripts/validation-demo.js** - Örnekler
4. **Browser Console** - Live testing

---

## ❓ SSS

**S: Validation bozulmuş ise ne yapmalı?**
A: Browser console'da `window.alertManager = new AlertManager()` çalıştırın

**S: Kendi validation kuralını nasıl eklerim?**
A: `src/scripts/validation.js`'de `PassengerValidator` sınıfını düzenleyin

**S: API'ye bağlanılamıyor?**
A: `app.js`'in `PORT 5004`'te çalıştığını kontrol edin

---

## 🚀 Sonraki Adımlar

1. ✅ Form elementlerine doğrulama ekle
2. ✅ Dynamik alert silme ekle
3. ✅ Toast bildirimleri ekle
4. ✅ Doğrulama istatistikleri göster

---

Başlamaya hazır mısınız? 🎉

```javascript
// Browser console'da:
ValidationDemo.showBasicAlerts();
```

Şimdi sayfayı yenileyin ve alertleri göreceksiniz! 🎉

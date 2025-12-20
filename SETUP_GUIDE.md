# 🚀 SkyRoster Flight Crew Roster System - Kurulum Kılavuzu

Bu kılavuz projeyi baştan sona kurmanıza ve çalıştırmanıza yardımcı olacak.

## 📋 İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Hızlı Başlangıç](#hızlı-başlangıç)
3. [Detaylı Kurulum](#detaylı-kurulum)
4. [Proje Yapısı](#proje-yapısı)
5. [Sorun Giderme](#sorun-giderme)

---

## 🖥️ Sistem Gereksinimleri

- **Node.js** 16+ ([indir](https://nodejs.org/))
- **MySQL** 8.0+ ([indir](https://dev.mysql.com/downloads/mysql/))
- **npm** 8+ (Node.js ile gelir)
- **Git** (isteğe bağlı)

### Kurulu Olup Olmadığını Kontrol Et

```bash
node --version    # v16.0.0 veya üzeri
npm --version     # 8.0.0 veya üzeri
mysql --version   # mysql  Ver 8.0 veya üzeri
```

---

## ⚡ Hızlı Başlangıç (5 Dakika)

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Veritabanını Kur

```bash
# MySQL terminali aç
mysql -u root -p

# Terminal'de:
CREATE DATABASE new_schemaSkyroster_db;
CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'apipassword';
GRANT ALL PRIVILEGES ON new_schemaSkyroster_db.* TO 'apiuser'@'localhost';
FLUSH PRIVILEGES;

# Veritabanını popüle et
source database/schema_skyroster.sql;
source database/seed_data.sql;
```

### 3. Sunucuları Başlat

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node index.js
# http://localhost:3000 üzerinde çalışacak
```

**Terminal 2 - Frontend (SCSS Watch):**
```bash
npm run sass
# main.scss → main.css otomatik derleniyor
```

**Terminal 3 - Frontend Web Server:**
```bash
# Node http-server kullan
npx http-server frontend/public -p 5501

# Veya Python kullan
python -m http.server 5501 -d frontend/public

# Veya herhangi bir local server (VS Code Live Server vb.)
```

### 4. Tarayıcı Açıkça

```
http://localhost:5501/index.html
```

Login: `admin` / `admin123`

---

## 🔧 Detaylı Kurulum

### Adım 1: Proje Dosyalarını İndir

```bash
git clone <repo-url> SkyRoster
cd SkyRoster
```

### Adım 2: Node Bağımlılıklarını Yükle

```bash
# Root dizinde
npm install

# Backend için (isteğe bağlı - ayrı package.json'ı var)
cd backend
npm install
cd ..
```

### Adım 3: MySQL Veritabanını Kur

#### Seçenek A: Terminal (Önerilen)

```bash
# MySQL'e giriş yap
mysql -u root -p

# Aşağıdaki SQL komutlarını çalıştır:
```

```sql
-- Veritabanı oluştur
CREATE DATABASE new_schemaSkyroster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kullanıcı oluştur
CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'apipassword';

-- İzinleri ver
GRANT ALL PRIVILEGES ON new_schemaSkyroster_db.* TO 'apiuser'@'localhost';
FLUSH PRIVILEGES;

-- Çık
EXIT;
```

#### Seçenek B: SQL Dosyasından (Otomatik)

```bash
# MySQL'e bağlan
mysql -u root -p new_schemaSkyroster_db < database/schema_skyroster.sql

# Seed verileri yükle
mysql -u root -p new_schemaSkyroster_db < database/seed_data.sql
```

### Adım 4: Environment Konfigürasyonu (İsteğe Bağlı)

Gerekirse `backend/index.js` içinde bağlantı ayarlarını değiştir:

```javascript
// backend/index.js - ~13. satır
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'apiuser',
    password: 'apipassword',
    database: 'new_schemaSkyroster_db',
    port: 3306
});
```

### Adım 5: SCSS'i Derle

```bash
# Tek seferlik derle
npm run sass

# Veya watch mode (otomatik)
npm run sass &
```

### Adım 6: Backend'i Başlat

```bash
cd backend
npm install
node index.js
```

**Beklenen çıktı:**
```
✅ MySQL connected
🚀 Server running on http://localhost:3000
```

### Adım 7: Frontend'i Başlat

**Ayrı bir terminal'de:**

```bash
# Seçenek 1: Node http-server
npx http-server frontend/public -p 5501 -c-1

# Seçenek 2: Python
python -m http.server 5501 -d frontend/public

# Seçenek 3: VS Code Live Server
# Extensions'tan "Live Server" kur
# frontend/public/index.html sağ-tıkla → "Open with Live Server"
```

### Adım 8: Tarayıcıda Test Et

```
http://localhost:5501/index.html
```

**Test Login'i:**
- Username: `admin`
- Password: `admin123`

---

## 📁 Proje Yapısı

```
SkyRoster/
│
├── frontend/                    # Frontend SPA
│   ├── public/                  # HTML & statik dosyalar
│   │   ├── index.html           # S1 - Login
│   │   ├── flight-search.html   # S2 - Flight Search
│   │   ├── roster-builder.html  # S3 - Roster Builder
│   │   ├── seat-assignment.html # S4 - Seat Assignment
│   │   ├── extended-roster.html # S5 - Crew Approval
│   │   ├── final-manifest.html  # S6 - Final Manifest
│   │   ├── main.js              # Ana JavaScript (tüm sayfalar)
│   │   └── styles/
│   │       └── main.css         # Derlenmiş CSS
│   ├── src/
│   │   ├── scripts/
│   │   │   └── index.js         # SCSS kaynağı
│   │   └── styles/
│   │       └── main.scss        # SCSS ana dosyası
│   ├── package.json
│   └── README.md                # Frontend kılavuzu
│
├── backend/                     # Express.js API
│   ├── index.js                 # Ana server dosyası
│   ├── auth.js                  # Authentication middleware
│   ├── package.json
│   ├── routes/
│   │   ├── flights.js           # Flight CRUD
│   │   ├── cabinCrew.js         # Crew CRUD
│   │   ├── vehicleTypes.js      # Vehicle Types
│   │   ├── roster.js            # Roster management
│   │   ├── menus.js
│   │   ├── roles.js
│   │   └── passengers.js
│   └── README.md                # Backend kılavuzu
│
├── database/                    # Database SQL
│   ├── schema_skyroster.sql     # Tablo tanımları
│   ├── seed_data.sql            # Test verileri
│   └── README.md                # Database kılavuzu
│
├── postman/                     # API testing
│   └── skyroster-flight-api.postman_collection.json
│
├── SETUP_GUIDE.md               # Bu dosya
├── README.md                    # Proje özeti
└── package.json                 # Root dependencies
```

---

## 🐛 Sorun Giderme

### MySQL Bağlantısı Hatası

**Hata:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Çözüm:**
```bash
# MySQL'in çalıştığını kontrol et
mysql -u root -p

# Veya (macOS Homebrew):
brew services start mysql@8.0

# Veya (Linux):
sudo systemctl start mysql

# Windows'ta:
# Services'ten MySQL'i başlat
```

### Port Zaten Kullanılıyor

**Hata:**
```
Error: listen EADDRINUSE :::3000
```

**Çözüm:**
```bash
# Port kullanan işlemi bul
lsof -i :3000

# Veya port değiştir (backend/index.js)
const PORT = 3001;  // 3000 yerine 3001
```

### CORS Hatası

**Hata:**
```
Access to XMLHttpRequest blocked by CORS
```

**Çözüm:** Backend `index.js`'de CORS kontrol et:
```javascript
app.use(cors({
    origin: ['http://localhost:5501', 'http://localhost:5500'],
    credentials: true
}));
```

### SCSS Değişiklikleri Yansımıyor

**Çözüm:**
```bash
# npm run sass durdur (Ctrl+C)
npm run sass

# Veya manuel derle
npx sass src/styles/main.scss public/styles/main.css
```

### Veritabanı Hatası: "Unknown database"

**Çözüm:**
```bash
# Veritabanını oluştur
mysql -u root -p -e "CREATE DATABASE new_schemaSkyroster_db;"

# Şemayı import et
mysql -u root -p new_schemaSkyroster_db < database/schema_skyroster.sql
```

### Seed Verileri Yüklenmiyor

**Çözüm:**
```bash
# SQL dosyasını kontrol et
cat database/seed_data.sql

# Manuel yükle
mysql -u root -p new_schemaSkyroster_db < database/seed_data.sql
```

---

## 📚 İlgili Dosyalar

- [Frontend README](frontend/README.md) - Frontend detayları
- [Backend README](backend/README.md) - API detayları
- [Database README](database/README.md) - Veritabanı şeması

---

## ✅ Kontrol Listesi

Kurulum tamamlandığında aşağıdakileri kontrol et:

- [ ] `npm install` çalıştırıldı
- [ ] MySQL veritabanı oluşturuldu
- [ ] Schema yüklendi (`schema_skyroster.sql`)
- [ ] Seed verileri yüklendi (`seed_data.sql`)
- [ ] Backend node index.js çalışıyor (port 3000)
- [ ] SCSS derlenmiş (main.css var)
- [ ] Frontend sunucu başlatılmış (port 5501)
- [ ] Tarayıcıda http://localhost:5501/index.html açılabiliyor
- [ ] Login başarılı (admin/admin123)
- [ ] Flight Search sayfası açılıyor

---

## 🚀 Sonraki Adımlar

1. **Geliştirme Başla:** Kodunuzu `frontend/src` ve `backend/routes`'te düzenle
2. **SCSS Değiştir:** `frontend/src/styles/main.scss`'ı düzenle
3. **API Testleri:** Postman koleksiyonunu kullan
4. **Database Sorgula:** MySQL Workbench veya terminal

---

## 📞 Destek Gereken Durumlar

- Bağımlılık hataları: `npm install --legacy-peer-deps` dene
- npm cache: `npm cache clean --force`
- Tüm paketleri yeniden yükle: `rm -rf node_modules && npm install`

---

**Son Güncelleme:** 18 Aralık 2025

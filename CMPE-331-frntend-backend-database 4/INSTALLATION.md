# SkyRoster AI - Installation Guide

## 📦 Proje Nasıl Gönderilir

### Seçenek 1: ZIP Dosyası (En Kolay)
```bash
# Proje klasöründe:
cd /Users/basakgunes/Downloads
zip -r CMPE-331-SkyRoster.zip CMPE-331-frntend-backend-database \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/backend/server.log"

# Oluşan CMPE-331-SkyRoster.zip dosyasını gönderin
```

### Seçenek 2: GitHub/GitLab (Önerilen)
```bash
# GitHub'da yeni bir repo oluşturun, sonra:
cd /Users/basakgunes/Downloads/CMPE-331-frntend-backend-database
git remote add origin https://github.com/KULLANICI_ADI/skyroster-ai.git
git push -u origin master
```

### Seçenek 3: Google Drive / Dropbox
- Klasörü sıkıştırmadan (node_modules hariç) paylaşın
- `.git` klasörünü dahil edin (commit history için)

---

## 🚀 Başkaları Nasıl Kurabilir

### Gereksinimler
- **Node.js** (v16 veya üzeri)
- **MySQL** (v8.0 veya üzeri)
- **Terminal/Command Prompt**
- **Git** (opsiyonel)

---

## 📋 Kurulum Adımları

### 1. Projeyi İndir/Aç
```bash
# ZIP ise:
unzip CMPE-331-SkyRoster.zip
cd CMPE-331-frntend-backend-database

# GitHub'dan:
git clone https://github.com/KULLANICI_ADI/skyroster-ai.git
cd skyroster-ai
```

---

### 2. MySQL Veritabanı Kur

#### a) MySQL Kullanıcısı Oluştur
```sql
mysql -u root -p

-- MySQL konsolunda:
CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'apipassword';
GRANT ALL PRIVILEGES ON *.* TO 'apiuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### b) Veritabanı Oluştur
```bash
mysql -u apiuser -papipassword < database/schema_skyroster.sql
```

#### c) Test Verilerini Yükle
```bash
mysql -u apiuser -papipassword new_schemaSkyroster_db < database/seed_data_real.sql
```

**Sonuç:**
- ✅ 165 passenger
- ✅ 40 cabin crew
- ✅ 15 flights (TK101-TK115)

---

### 3. Backend Kur

```bash
cd backend
npm install
node index.js
```

**Görmeli:**
```
✅ Loaded 20 mock users from mockUsers.json
INDEX.JS LOADED
CORS MIDDLEWARE APPLIED
MySQL pool created for apiuser@127.0.0.1 DB: new_schemaSkyroster_db
*** INDEX.JS SERVER STARTED ***
Listening at http://0.0.0.0:3000
```

---

### 4. Frontend Kur

**Yeni terminal aç:**
```bash
# Proje kök dizininde:
npm install
npm run sass
```

**Üçüncü terminal:**
```bash
npx http-server frontend/public -p 5500 --cors
```

**Ya da VS Code Live Server kullan:**
- `frontend/public/index.html` sağ tık → "Open with Live Server"

---

### 5. Tarayıcıda Aç

http://localhost:5500

**Login:**
- Username: `admin`
- Password: `admin123`

---

## 🔧 Sorun Giderme

### "Port 3000 already in use"
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMARASI] /F
```

### "Cannot connect to MySQL"
```bash
# MySQL çalışıyor mu kontrol et:
mysql -u apiuser -papipassword -e "SELECT 1"

# Veritabanı var mı:
mysql -u apiuser -papipassword -e "SHOW DATABASES LIKE 'new_schema%'"
```

### "Failed to fetch" Hatası
1. Backend çalışıyor mu? → `curl http://localhost:3000/health`
2. Frontend port 5500'de mi? → Tarayıcıda `http://localhost:5500` kontrol et
3. CORS hatası varsa → Backend'i yeniden başlat

---

## 📂 Klasör Yapısı

```
CMPE-331-frntend-backend-database/
├── backend/
│   ├── index.js           # Express sunucu
│   ├── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── roster.js      # Roster endpoints
│   │   ├── flights.js     # Flight CRUD
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html     # S1: Login
│   │   ├── flight-search.html
│   │   ├── roster-builder.html
│   │   ├── seat-assignment.html
│   │   ├── extended-roster.html
│   │   ├── final-manifest.html
│   │   └── main.js        # Tüm frontend logic
│   └── src/styles/main.scss
├── database/
│   ├── schema_skyroster.sql      # DB schema
│   └── seed_data_real.sql        # Test data
├── FINAL_STATE.md         # Özellik listesi
└── SAVED_CHANGES.txt      # Son değişiklikler
```

---

## ✅ Test Etme

### 1. Backend Test
```bash
curl http://localhost:3000/health
# Yanıt: {"status":"OK"}

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# JWT token dönmeli
```

### 2. Frontend Test
1. http://localhost:5500 → Login sayfası
2. admin/admin123 → Giriş yap
3. Flight search → TK101 seç
4. Generate Roster → Pilot/crew/passenger listesi görmeli
5. Seat Assignment → Drag-and-drop çalışmalı
6. Approve Roster → Manifest ekranı açılmalı

---

## 🎯 Önemli Notlar

- **INFANT** yolcular: Parentle aynı koltukta (grayed out)
- **CHILD** yolcular: Kendi koltuğuna sahip (draggable)
- **ADULT** yolcular: Kendi koltuğuna sahip
- Tüm infants'ın parentları aynı uçuşta (DB validated)

---

## 🆘 Destek

Sorun yaşarsanız:
1. `backend/server.log` dosyasını kontrol edin
2. Browser console'u açın (F12)
3. MySQL bağlantısını test edin
4. Port 3000 ve 5500'ün açık olduğundan emin olun

---

## 📝 Lisans

Bu proje CMPE 331 Final Projesi olarak geliştirilmiştir.

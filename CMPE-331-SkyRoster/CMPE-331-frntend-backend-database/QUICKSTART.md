# 🚀 SkyRoster - Başlangıç Rehberi

Teminiz, **temiz ve düzenli** proje yapısı!

---

## 📁 Proje Klasörleri

```
SkyRoster/
├── 🎨 frontend/             ← Frontend kaynakları
│   ├── public/              ← HTML & CSS & JS (WEB)
│   ├── src/                 ← SCSS kaynakları
│   └── README.md            ← Frontend kılavuzu
│
├── 🔗 backend/              ← API Sunucusu
│   ├── routes/              ← API route'ları
│   ├── index.js             ← Server başlangıcı
│   ├── auth.js              ← JWT middleware
│   ├── package.json
│   └── README.md            ← Backend kılavuzu
│
├── 🗄️ database/             ← Veritabanı
│   ├── schema_skyroster.sql ← Tablo oluştur
│   ├── seed_data.sql        ← Test verileri
│   └── README.md            ← Database kılavuzu
│
├── 📖 SETUP_GUIDE.md        ← Detaylı kurulum
├── 📖 README.md             ← Proje özeti
└── 📖 package.json          ← Dependencies
```

---

## ⚡ Hızlı Başlangıç (5 dakika)

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. MySQL'i Kur
```bash
mysql -u root -p
```

```sql
CREATE DATABASE new_schemaSkyroster_db;
CREATE USER 'apiuser'@'localhost' IDENTIFIED BY 'apipassword';
GRANT ALL PRIVILEGES ON new_schemaSkyroster_db.* TO 'apiuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Verileri Yükle
```bash
mysql -u root -p new_schemaSkyroster_db < database/schema_skyroster.sql
mysql -u root -p new_schemaSkyroster_db < database/seed_data.sql
```

### 4. Backend Başlat (Terminal 1)
```bash
cd backend
npm install
node index.js
# ✅ http://localhost:3000
```

### 5. SCSS Derle (Terminal 2)
```bash
npm run sass
```

### 6. Frontend Sunucusu (Terminal 3)
```bash
npx http-server frontend/public -p 5501
# ✅ http://localhost:5501/index.html
```

### 7. Test Et
```
Login: admin / admin123
```

---

## 📚 Detaylı Rehberler

| Dosya | İçerik | Okuma Süresi |
|-------|--------|---------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | **Baştan sona kurulum detayları** | 15 min |
| [frontend/README.md](frontend/README.md) | Frontend mimarisi & geliştirme | 20 min |
| [backend/README.md](backend/README.md) | API endpoints & authentication | 15 min |
| [database/README.md](database/README.md) | Veritabanı şeması | 10 min |

---

## 🎯 6-Screen Workflow

**Adımları sırasıyla takip et:**

1. **S1 - Login** (`index.html`)
   - Username: admin
   - Password: admin123

2. **S2 - Flight Search** (`flight-search.html`)
   - Uçuş seç: TK123

3. **S3 - Roster Builder** (`roster-builder.html`)
   - "AUTO-GENERATE ROSTER" tıkla

4. **S4 - Seat Assignment** (`seat-assignment.html`)
   - "AUTO-ASSIGN SEATS" tıkla
   - Koltuklar A1, A2, A3'e yeşillenecek

5. **S5 - Crew Approval** (`extended-roster.html`)
   - Roster'ı gözden geçir
   - "APPROVE & PROCEED" tıkla

6. **S6 - Final Manifest** (`final-manifest.html`)
   - Print & Download testleri yap

---

## 🛠️ Geliştirme İşleri

### Frontend Düzenle
```bash
# JavaScript
nano frontend/public/main.js

# SCSS Styling
nano frontend/src/styles/main.scss
npm run sass  # Derle
```

### Backend Düzenle
```bash
# API Routes
nano backend/routes/flights.js

# Main Server
nano backend/index.js
# node index.js ile restart et
```

### Database Düzenle
```bash
mysql -u apiuser -p new_schemaSkyroster_db
# SQL komutları çalıştır
```

---

## 🔐 Test Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | CrewManager |
| pilot1 | pilot123 | Pilot |
| crew1 | crew123 | Cabin |

---

## 🐛 Sorunlar?

### 1. MySQL Bağlantısı Hatası
```bash
# MySQL'i başlat
brew services start mysql@8.0  # macOS
```

### 2. Port Zaten Kullanılıyor
```bash
lsof -i :3000
lsof -i :5501
```

### 3. SCSS Derlenmiyor
```bash
npm run sass
```

### 4. Daha Fazla Yardım
👉 [SETUP_GUIDE.md](SETUP_GUIDE.md#sorun-giderme) kontrol et

---

## 📊 Proje Durumu

✅ **Tamamlandı:**
- Frontend (6 screen)
- Backend API (Express.js)
- Authentication (JWT)
- Database (MySQL)
- Role-Based Access Control
- Seat Assignment
- Manifest Export

⏳ **İsteğe Bağlı:**
- Advanced seat features
- Analytics & Reports
- Multi-language support

---

## 📖 Dosya Açıklaması

### Ana Dosyalar

**Root Dizini:**
- `README.md` → Proje özeti
- `SETUP_GUIDE.md` → Detaylı kurulum
- `package.json` → npm bağımlılıkları

**Frontend:**
- `frontend/README.md` → Frontend kılavuzu
- `frontend/public/main.js` → Tüm screens JavaScript
- `frontend/src/styles/main.scss` → Styling

**Backend:**
- `backend/README.md` → Backend kılavuzu
- `backend/index.js` → Express server
- `backend/auth.js` → JWT middleware
- `backend/routes/` → API route'ları

**Database:**
- `database/README.md` → Database kılavuzu
- `database/schema_skyroster.sql` → Tablo oluştur
- `database/seed_data.sql` → Test verileri

---

## 🎓 Öğrenme Yolu

Proje üzerinde çalışırken aşağıdaki sırayı takip et:

1. **SETUP_GUIDE.md oku** (kurulum)
2. **frontend/README.md oku** (UI anla)
3. **backend/README.md oku** (API anla)
4. **database/README.md oku** (veri anla)
5. **Kod üzerinde çalış** (düzenle)

---

## 💾 Ekip Geliştirmesi

Projeyi ekip arkadaşlarınla paylaş:

```bash
# Tüm klasörü ZIP'le
zip -r SkyRoster.zip SkyRoster/

# Veya GitHub'a push et
git add .
git commit -m "Project v1.0"
git push origin main
```

---

## ✨ Temiz Proje Yapısı

✅ **Ne yapılmadı:**
- ❌ Gereksiz test dosyaları
- ❌ Eski dokumentasyon dosyaları
- ❌ Config dosya kargaşası

✅ **Ne var:**
- ✅ Frontend, Backend, Database ayrı klasör
- ✅ Temiz README'ler
- ✅ Çalışan kod
- ✅ Detaylı kılavuzlar

---

## 🚀 Sonraki Adımlar

1. **Kurulum yap** → [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **Çalıştır** → npm install → node backend/index.js
3. **Test et** → Login → Workflow'u takip et
4. **Geliştir** → Kod düzenle
5. **Paylaş** → Ekip arkadaşlarına gönder

---

## 📞 Destek

Sorular veya sorunlar:

1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** kontrol et
2. **Console** hatalarını oku (F12)
3. **MySQL** bağlantısını doğrula
4. Terminal çıktılarını kontrol et

---

**🎉 Kuruluma hazırsan: [SETUP_GUIDE.md](SETUP_GUIDE.md) oku!**

**Versiyon:** 1.0.0 | **Tarih:** 18 Aralık 2025 | **Status:** ✅ Üretim Hazır

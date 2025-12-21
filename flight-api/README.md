# Skyroster / Flight API

## Kurulum

```bash
git clone <REPO_URL>
cd FLIGHT-API
npm install
```

## Veritabanı Kurulumu (MySQL)

MySQL'e bağlandıktan sonra:

```sql
SOURCE /tam/yol/FLIGHT-API/sql/schema_skyroster.sql;
```

veya MySQL Workbench içinde dosyayı açıp çalıştırın.

## Çalıştırma

```bash
node index.js
```

Varsayılan kullanıcı:

- username: `admin`
- password: `admin123`

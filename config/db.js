const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',         // <-- Kendi MySQL kullanıcı adını buraya yaz
    password: '',         // <-- Kendi MySQL şifreni buraya yaz
    database: 'SkyRoster_System', // <-- Veritabanı adın
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
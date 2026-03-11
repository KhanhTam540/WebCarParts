const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 26150,
    ssl: {
        // Đọc file cert từ thư mục certs hoặc dùng cấu hình từ Render
        ca: process.env.DB_SSL_CA || (fs.existsSync(path.join(__dirname, '../../certs/ca.pem')) 
            ? fs.readFileSync(path.join(__dirname, '../../certs/ca.pem')) 
            : undefined),
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

module.exports = pool;
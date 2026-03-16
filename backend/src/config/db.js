const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình pool kết nối MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Aiven thường dùng cổng khác 3306, hãy đảm bảo đã cấu hình DB_PORT trên Render
    port: parseInt(process.env.DB_PORT) || 3306, 
    
    // QUAN TRỌNG: Cấu hình SSL để kết nối được với Aiven
    ssl: {
        rejectUnauthorized: false
    },
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Kiểm tra kết nối khi khởi động
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối cơ sở dữ liệu Aiven thành công!');
        
        await connection.query("SET NAMES utf8mb4");
        connection.release();
    } catch (err) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.message);
        // In ra thêm thông tin để debug nếu cần
        if (err.code === 'ETIMEDOUT') {
            console.error('👉 Gợi ý: Hãy kiểm tra xem đã whitelist IP 0.0.0.0/0 trên Aiven chưa.');
        }
    }
};

testConnection();

module.exports = pool;
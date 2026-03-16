const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình pool kết nối MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'car_parts_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Thêm dòng này để đảm bảo dữ liệu gửi/nhận luôn là UTF-8
    charset: 'utf8mb4'
});

// Kiểm tra kết nối khi khởi động
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối cơ sở dữ liệu thành công!');
        
        // Đảm bảo session này cũng dùng utf8mb4 (tùy chọn nhưng an toàn)
        await connection.query("SET NAMES utf8mb4");
        
        connection.release();
    } catch (err) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.message);
    }
};

testConnection();

module.exports = pool;
-- =============================================
-- SEED DATA FOR CAR PARTS DATABASE
-- =============================================

-- Chọn database
USE car_parts_db;

-- ========== 1. ROLES ==========
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'admin'), 
(2, 'user');

-- ========== 2. USERS ==========
-- Xóa user cũ nếu có để tránh conflict (chỉ dùng khi cần)
-- DELETE FROM users WHERE id IN (1,2);

INSERT IGNORE INTO users (id, username, password, email, full_name, phone, address, is_active) VALUES
(1, 'admin', '$2a$10$mFm2pLg9x7.PqYqXqYqXqOqXqYqXqYqXqYqXqYqXqYqXqYqXqY', 'admin@carparts.com', 'System Admin', NULL, NULL, TRUE),
(2, 'user1', '$2a$10$mFm2pLg9x7.PqYqXqYqXqOqXqYqXqYqXqYqXqYqXqYqXqYqXqY', 'user1@example.com', 'Nguyễn Văn A', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', TRUE);

-- ========== 3. USER ROLES ==========
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
(1, 1),
(2, 2);

-- ========== 4. NOTIFICATIONS ==========
-- Xóa dữ liệu cũ trong bảng notifications trước khi insert (nếu cần reset)
-- DELETE FROM notifications;

INSERT IGNORE INTO notifications (user_id, type, title, message, data, is_read, created_at) VALUES
(2, 'order_created', 'Đơn hàng đã được tạo', 'Đơn hàng #1 đã được tạo thành công với tổng giá trị 1.500.000₫', '{"orderId":1}', TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 'order_confirmed', 'Đơn hàng đã được xác nhận', 'Đơn hàng #1 đã được xác nhận thanh toán. Chúng tôi sẽ sớm giao hàng cho bạn.', '{"orderId":1}', TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 'order_shipped', 'Đơn hàng đang được giao', 'Đơn hàng #1 đang được vận chuyển. Dự kiến giao trong 3-5 ngày.', '{"orderId":1}', TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'order_delivered', 'Đơn hàng đã giao thành công', 'Đơn hàng #1 đã được giao thành công. Cảm ơn bạn đã mua sắm!', '{"orderId":1}', TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 'order_created', 'Đơn hàng mới', 'Đơn hàng #2 đã được tạo thành công với tổng giá trị 850.000₫', '{"orderId":2}', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'order_confirmed', 'Đơn hàng đã xác nhận', 'Đơn hàng #2 đã được xác nhận thanh toán', '{"orderId":2}', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'promotion', 'Khuyến mãi đặc biệt', 'Giảm giá 20% cho tất cả phụ tùng động cơ', '{}', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- ========== 5. BRANDS ==========
INSERT IGNORE INTO brands (name, country) VALUES
('Toyota', 'Japan'),
('Honda', 'Japan'),
('Ford', 'USA'),
('Hyundai', 'South Korea'),
('Mercedes-Benz', 'Germany'),
('BMW', 'Germany'),
('Mazda', 'Japan'),
('Kia', 'South Korea');

-- ========== 6. CAR MODELS ==========
INSERT IGNORE INTO car_models (brand_id, name) VALUES
-- Toyota (brand_id = 1)
(1, 'Camry'),
(1, 'Corolla'),
(1, 'Vios'),
-- Honda (brand_id = 2)
(2, 'Civic'),
(2, 'CR-V'),
(2, 'City'),
-- Ford (brand_id = 3)
(3, 'Ranger'),
(3, 'Everest'),
-- Hyundai (brand_id = 4)
(4, 'Accent'),
(4, 'Tucson'),
-- Mercedes (brand_id = 5)
(5, 'C-Class'),
-- BMW (brand_id = 6)
(6, '3 Series'),
-- Mazda (brand_id = 7)
(7, 'Mazda3'),
(7, 'CX-5'),
-- Kia (brand_id = 8)
(8, 'Seltos'),
(8, 'K3');

-- ========== 7. MODEL YEARS ==========
INSERT IGNORE INTO model_years (model_id, year) VALUES
-- Camry (model_id = 1)
(1, 2022), (1, 2023), (1, 2024),
-- Corolla (model_id = 2)
(2, 2022), (2, 2023),
-- Vios (model_id = 3)
(3, 2023), (3, 2024),
-- Civic (model_id = 4)
(4, 2022), (4, 2023), (4, 2024),
-- CR-V (model_id = 5)
(5, 2023), (5, 2024),
-- City (model_id = 6)
(6, 2023),
-- Ranger (model_id = 7)
(7, 2023), (7, 2024),
-- Everest (model_id = 8)
(8, 2023),
-- Accent (model_id = 9)
(9, 2023), (9, 2024),
-- Tucson (model_id = 10)
(10, 2023),
-- C-Class (model_id = 11)
(11, 2023),
-- 3 Series (model_id = 12)
(12, 2023),
-- Mazda3 (model_id = 13)
(13, 2023), (13, 2024),
-- CX-5 (model_id = 14)
(14, 2023),
-- Seltos (model_id = 15)
(15, 2023), (15, 2024),
-- K3 (model_id = 16)
(16, 2023);

-- ========== 8. CATEGORIES ==========
INSERT IGNORE INTO categories (name) VALUES
('Động cơ'),
('Hệ thống phanh'),
('Hệ thống điện'),
('Thân vỏ xe'),
('Hệ thống treo'),
('Hệ thống lái'),
('Phụ kiện nội thất'),
('Phụ kiện ngoại thất');

-- ========== 9. PARTS ==========
INSERT IGNORE INTO parts (category_id, name, description, price, stock_quantity, image_url) VALUES
-- Động cơ
(1, 'Lọc dầu động cơ Toyota', 'Lọc dầu chính hãng cho các dòng xe Toyota', 150000, 100, NULL),
(1, 'Bugi NGK Iridium', 'Bugi đánh lửa cao cấp NGK Iridium, phù hợp nhiều dòng xe', 85000, 200, NULL),
(1, 'Dây curoa tổng Honda', 'Dây curoa tổng cho động cơ Honda 1.5L', 320000, 50, NULL),
-- Hệ thống phanh
(2, 'Má phanh trước Brembo', 'Má phanh hiệu suất cao Brembo cho sedan', 450000, 80, NULL),
(2, 'Đĩa phanh sau Toyota Camry', 'Đĩa phanh sau chính hãng cho Toyota Camry', 680000, 30, NULL),
(2, 'Dầu phanh DOT4 Bosch', 'Dầu phanh Bosch DOT4 1 lít', 120000, 150, NULL),
-- Hệ thống điện
(3, 'Ắc quy Varta 12V 60Ah', 'Ắc quy khởi động Varta chính hãng', 1500000, 40, NULL),
(3, 'Bóng đèn pha LED H7', 'Bóng đèn LED H7 siêu sáng 6000K', 350000, 120, NULL),
(3, 'Còi xe Hella Twin Tone', 'Còi xe Hella âm thanh kép chính hãng', 280000, 60, NULL),
-- Thân vỏ xe
(4, 'Gương chiếu hậu trái Honda Civic', 'Gương chiếu hậu điện chỉnh cho Honda Civic', 850000, 25, NULL),
(4, 'Cản trước Ford Ranger', 'Cản trước nguyên bản Ford Ranger 2023', 2500000, 15, NULL),
-- Hệ thống treo
(5, 'Giảm xóc trước KYB', 'Giảm xóc trước KYB Excel-G cho sedan', 750000, 45, NULL),
(5, 'Cao su chân máy Toyota', 'Cao su chân máy chống rung cho Toyota', 220000, 70, NULL),
-- Hệ thống lái
(6, 'Rotuyn lái ngoài Toyota Vios', 'Rotuyn lái ngoài chính hãng cho Vios', 180000, 55, NULL),
(6, 'Dầu trợ lực lái ATF', 'Dầu trợ lực lái tổng hợp 1 lít', 95000, 130, NULL);

-- ========== 10. PART COMPATIBILITY ==========
INSERT IGNORE INTO part_compatibility (part_id, model_year_id) VALUES
-- Part 1 (Lọc dầu Toyota) - các năm của Camry, Corolla, Vios
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
-- Part 2 (Bugi) - các dòng xe phổ thông
(2, 1), (2, 2), (2, 4), (2, 5), (2, 8), (2, 9), (2, 10),
-- Part 3 (Dây curoa Honda) - các dòng Honda
(3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13),
-- Part 4 (Má phanh) - Camry, Civic
(4, 1), (4, 2), (4, 3), (4, 8), (4, 9), (4, 10),
-- Part 5 (Đĩa phanh Camry) - chỉ Camry
(5, 1), (5, 2), (5, 3),
-- Part 6 (Dầu phanh) - đa dụng
(6, 1), (6, 2), (6, 8), (6, 9), (6, 14), (6, 15),
-- Part 7 (Ắc quy) - đa dụng
(7, 1), (7, 2), (7, 8), (7, 9), (7, 14), (7, 15), (7, 17), (7, 18),
-- Part 8 (Bóng đèn) - đa dụng
(8, 1), (8, 2), (8, 4), (8, 5), (8, 8), (8, 9),
-- Part 10 (Gương Honda) - các dòng Honda
(10, 8), (10, 9), (10, 10),
-- Part 11 (Cản Ford) - Ranger
(11, 14), (11, 15),
-- Part 12 (Giảm xóc) - đa dụng
(12, 1), (12, 2), (12, 4), (12, 5), (12, 8), (12, 9),
-- Part 13 (Cao su chân máy) - Toyota
(13, 1), (13, 2), (13, 3), (13, 6), (13, 7),
-- Part 14 (Rotuyn lái) - Vios
(14, 6), (14, 7);

-- ========== KIỂM TRA DỮ LIỆU ==========
SELECT 'Seed data completed successfully!' AS 'Status';
SELECT CONCAT('Users: ', COUNT(*)) AS 'Summary' FROM users;
SELECT CONCAT('Brands: ', COUNT(*)) AS 'Summary' FROM brands;
SELECT CONCAT('Car models: ', COUNT(*)) AS 'Summary' FROM car_models;
SELECT CONCAT('Parts: ', COUNT(*)) AS 'Summary' FROM parts;
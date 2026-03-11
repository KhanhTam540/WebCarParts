-- =============================================
-- Seed Data for Car Parts Database
-- =============================================

USE car_parts_db;

-- ========== ROLES ==========
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'admin'), 
(2, 'user');

-- ========== USERS ==========
INSERT IGNORE INTO users (id, username, password, email, full_name, phone, address, is_active) VALUES
(1, 'admin', '$2a$10$mFm2pLg9x7.PqYqXqYqXqOqXqYqXqYqXqYqXqYqXqYqXqYqXqY', 'admin@carparts.com', 'System Admin', NULL, NULL, TRUE);


-- ========== USER ROLES ==========
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
(1, 1);

-- ========== NOTIFICATIONS ==========
INSERT IGNORE INTO notifications (user_id, type, title, message, data, is_read, created_at) VALUES
(2, 'order_created', N'Đơn hàng đã được tạo', N'Đơn hàng #1 đã được tạo thành công với tổng giá trị 1.500.000₫', '{"orderId":1}', TRUE, NOW() - INTERVAL 7 DAY),
(2, 'order_confirmed', N'Đơn hàng đã được xác nhận', N'Đơn hàng #1 đã được xác nhận thanh toán. Chúng tôi sẽ sớm giao hàng cho bạn.', '{"orderId":1}', TRUE, NOW() - INTERVAL 6 DAY),
(2, 'order_shipped', N'Đơn hàng đang được giao', N'Đơn hàng #1 đang được vận chuyển. Dự kiến giao trong 3-5 ngày.', '{"orderId":1}', TRUE, NOW() - INTERVAL 5 DAY),
(2, 'order_delivered', N'Đơn hàng đã giao thành công', N'Đơn hàng #1 đã được giao thành công. Cảm ơn bạn đã mua sắm!', '{"orderId":1}', TRUE, NOW() - INTERVAL 4 DAY),
(2, 'order_created', N'Đơn hàng mới', N'Đơn hàng #2 đã được tạo thành công với tổng giá trị 850.000₫', '{"orderId":2}', FALSE, NOW() - INTERVAL 2 DAY),
(2, 'order_confirmed', N'Đơn hàng đã xác nhận', N'Đơn hàng #2 đã được xác nhận thanh toán', '{"orderId":2}', FALSE, NOW() - INTERVAL 1 DAY),
(2, 'promotion', N'Khuyến mãi đặc biệt', N'Giảm giá 20% cho tất cả phụ tùng động cơ', '{}', FALSE, NOW() - INTERVAL 12 HOUR);

-- ========== BRANDS ==========
INSERT IGNORE INTO brands (name, country) VALUES
('Toyota', 'Japan'),
('Honda', 'Japan'),
('Ford', 'USA'),
('Hyundai', 'South Korea'),
('Mercedes-Benz', 'Germany'),
('BMW', 'Germany'),
('Mazda', 'Japan'),
('Kia', 'South Korea');

-- ========== CAR MODELS ==========
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

-- ========== MODEL YEARS ==========
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

-- ========== CATEGORIES ==========
INSERT IGNORE INTO categories (name) VALUES
(N'Động cơ'),
(N'Hệ thống phanh'),
(N'Hệ thống điện'),
(N'Thân vỏ xe'),
(N'Hệ thống treo'),
(N'Hệ thống lái'),
(N'Phụ kiện nội thất'),
(N'Phụ kiện ngoại thất');

-- ========== PARTS ==========
INSERT IGNORE INTO parts (category_id, name, description, price, stock_quantity, image_url) VALUES
-- Động cơ
(1, N'Lọc dầu động cơ Toyota', N'Lọc dầu chính hãng cho các dòng xe Toyota', 150000, 100, NULL),
(1, N'Bugi NGK Iridium', N'Bugi đánh lửa cao cấp NGK Iridium, phù hợp nhiều dòng xe', 85000, 200, NULL),
(1, N'Dây curoa tổng Honda', N'Dây curoa tổng cho động cơ Honda 1.5L', 320000, 50, NULL),
-- Hệ thống phanh
(2, N'Má phanh trước Brembo', N'Má phanh hiệu suất cao Brembo cho sedan', 450000, 80, NULL),
(2, N'Đĩa phanh sau Toyota Camry', N'Đĩa phanh sau chính hãng cho Toyota Camry', 680000, 30, NULL),
(2, N'Dầu phanh DOT4 Bosch', N'Dầu phanh Bosch DOT4 1 lít', 120000, 150, NULL),
-- Hệ thống điện
(3, N'Ắc quy Varta 12V 60Ah', N'Ắc quy khởi động Varta chính hãng', 1500000, 40, NULL),
(3, N'Bóng đèn pha LED H7', N'Bóng đèn LED H7 siêu sáng 6000K', 350000, 120, NULL),
(3, N'Còi xe Hella Twin Tone', N'Còi xe Hella âm thanh kép chính hãng', 280000, 60, NULL),
-- Thân vỏ xe
(4, N'Gương chiếu hậu trái Honda Civic', N'Gương chiếu hậu điện chỉnh cho Honda Civic', 850000, 25, NULL),
(4, N'Cản trước Ford Ranger', N'Cản trước nguyên bản Ford Ranger 2023', 2500000, 15, NULL),
-- Hệ thống treo
(5, N'Giảm xóc trước KYB', N'Giảm xóc trước KYB Excel-G cho sedan', 750000, 45, NULL),
(5, N'Cao su chân máy Toyota', N'Cao su chân máy chống rung cho Toyota', 220000, 70, NULL),
-- Hệ thống lái
(6, N'Rotuyn lái ngoài Toyota Vios', N'Rotuyn lái ngoài chính hãng cho Vios', 180000, 55, NULL),
(6, N'Dầu trợ lực lái ATF', N'Dầu trợ lực lái tổng hợp 1 lít', 95000, 130, NULL);

-- ========== PART COMPATIBILITY ==========
INSERT IGNORE INTO part_compatibility (part_id, model_year_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 1), (2, 2), (2, 4), (2, 5), (2, 8), (2, 9), (2, 10),
(3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13),
(4, 1), (4, 2), (4, 3), (4, 8), (4, 9), (4, 10),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 2), (6, 8), (6, 9), (6, 14), (6, 15),
(7, 1), (7, 2), (7, 8), (7, 9), (7, 14), (7, 15), (7, 17), (7, 18),
(8, 1), (8, 2), (8, 4), (8, 5), (8, 8), (8, 9),
(10, 8), (10, 9), (10, 10),
(11, 14), (11, 15),
(12, 1), (12, 2), (12, 4), (12, 5), (12, 8), (12, 9),
(13, 1), (13, 2), (13, 3), (13, 6), (13, 7),
(14, 6), (14, 7);
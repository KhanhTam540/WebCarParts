const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false 
  },
  connectionTimeout: 50000,
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==================== REGISTER ====================
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );
    const userId = result.insertId;

    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)', [userId]);

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await db.query(
      'INSERT INTO otp_verifications (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [userId, otpCode, expiresAt]
    );

    try {
    await transporter.sendMail({
        from: `"Car Parts Store" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Xác thực OTP',
        html: `<b>Mã của bạn là: ${otpCode}</b>`
    });
    console.log("✅ Gửi mail thành công");
} catch (error) {
    // Nếu timeout, chỉ log lỗi chứ không trả về lỗi 500 cho khách hàng
    console.error("❌ Lỗi Mail (Timeout):", error.message);
}

// Luôn trả về thành công sau khi đã lưu User vào Database thành công
res.status(201).json({
    success: true,
    message: 'Đăng ký thành công (OTP đã được xử lý)'
});

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      data: { userId, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== VERIFY OTP ====================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp_code } = req.body;

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userId = users[0].id;

    const [otps] = await db.query(
      'SELECT id FROM otp_verifications WHERE user_id = ? AND otp_code = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, otp_code]
    );

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await db.query('UPDATE users SET is_active = TRUE WHERE id = ?', [userId]);
    await db.query('DELETE FROM otp_verifications WHERE user_id = ?', [userId]);

    res.json({ success: true, message: 'Account verified successfully. You can now login.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== LOGIN (SỬA QUAN TRỌNG) ====================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('=================================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Username:', username);
    console.log('Time:', new Date().toISOString());

    // Sử dụng GROUP_CONCAT để lấy tất cả roles của user
    const [users] = await db.query(
      `SELECT u.id, u.username, u.password, u.email, u.full_name, u.is_active,
              GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.username = ?
       GROUP BY u.id`,
      [username]
    );

    console.log(`Found ${users.length} user(s) with this username`);

    if (users.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = users[0];
    
    // Xác định role từ database
    let role = 'user';
    if (user.roles) {
      const rolesList = user.roles.split(',');
      // Nếu có role admin trong danh sách, ưu tiên admin
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }
    
    console.log('📊 User details:');
    console.log('  - ID:', user.id);
    console.log('  - Username:', user.username);
    console.log('  - Email:', user.email);
    console.log('  - Is Active:', user.is_active);
    console.log('  - Roles from DB:', user.roles);
    console.log('  - Selected Role:', role);
    console.log('  - Password Hash Length:', user.password.length);

    if (!user.is_active) {
      console.log('❌ Account is not active');
      return res.status(403).json({ 
        success: false, 
        message: 'Account not verified or has been locked. Please verify your email first or contact admin.' 
      });
    }

    console.log('🔑 Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    console.log('✅ Password correct!');

    // Tạo JWT token với role đã xác định
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: role  // QUAN TRỌNG: role phải được đưa vào token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login successful!');
    console.log('=================================');

    // Trả về đầy đủ thông tin user bao gồm role
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: role,  // QUAN TRỌNG: role phải được trả về
          is_active: user.is_active === 1 || user.is_active === true
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error details:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { register, verifyOtp, login };
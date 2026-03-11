const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/db');

// Email transporter (giữ nguyên để gửi mail thông báo)
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
  connectionTimeout: 5000,
});

// ==================== REGISTER - KHÔNG CẦN OTP ====================
exports.register = async (req, res) => {
  const { username, password, email, full_name, phone, address } = req.body;
  
  try {
    console.log('📝 Register attempt:', { username, email, full_name });

    // 1. Kiểm tra username đã tồn tại chưa
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      let message = 'Username or email already exists';
      
      // Kiểm tra cụ thể hơn
      const [checkUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
      const [checkEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      
      if (checkUsername.length > 0) message = 'Username already exists';
      if (checkEmail.length > 0) message = 'Email already exists';
      
      return res.status(400).json({ 
        success: false, 
        message 
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // 3. Chèn user với is_active = 1 (KHÔNG CẦN XÁC THỰC)
    const [userResult] = await db.query(
      'INSERT INTO users (username, password, email, full_name, phone, address, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, email, full_name || null, phone || null, address || null, 1] // is_active = 1
    );

    const userId = userResult.insertId;
    console.log('✅ User inserted with ID:', userId);

    // 4. Gán role mặc định là 'user' (role_id = 2)
    await db.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, 2]);
    console.log('✅ User role assigned');

    // 5. Gửi email thông báo (KHÔNG BẮT BUỘC - không ảnh hưởng đến đăng ký)
    try {
      const mailOptions = {
        from: `"WebCarParts" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Đăng ký tài khoản thành công',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Chào mừng bạn đến với WebCarParts!</h2>
            <p>Xin chào <strong>${full_name || username}</strong>,</p>
            <p>Tài khoản của bạn đã được tạo thành công và đã được kích hoạt.</p>
            <p>Bạn có thể đăng nhập ngay bây giờ với thông tin:</p>
            <ul>
              <li><strong>Username:</strong> ${username}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
            <p>Truy cập: <a href="https://webcarparts.onrender.com">https://webcarparts.onrender.com</a></p>
            <hr>
            <p style="color: #666;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to:', email);
    } catch (mailError) {
      // Chỉ log lỗi, không ảnh hưởng đến response
      console.error('⚠️ Welcome email failed (non-critical):', mailError.message);
    }

    // 6. Trả về thành công
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
      data: {
        username,
        email,
        full_name: full_name || null
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.' 
    });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('=================================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('Username:', username);
    console.log('Time:', new Date().toISOString());

    // Lấy user info cùng với roles
    const [users] = await db.query(
      `SELECT u.id, u.username, u.password, u.email, u.full_name, u.is_active,
              GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.username = ? OR u.email = ?
       GROUP BY u.id`,
      [username, username]
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Sai tên đăng nhập hoặc mật khẩu' 
      });
    }

    const user = users[0];
    
    // Kiểm tra active (với register mới thì luôn active)
    if (!user.is_active) {
      console.log('❌ Account not active');
      return res.status(403).json({ 
        success: false, 
        message: 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ admin.' 
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ 
        success: false, 
        message: 'Sai tên đăng nhập hoặc mật khẩu' 
      });
    }

    // Xác định role
    let role = 'user';
    if (user.roles) {
      const rolesList = user.roles.split(',');
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }

    // Tạo token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Login successful for:', username);
    console.log('=================================');

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: role,
          is_active: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server. Vui lòng thử lại sau.' 
    });
  }
};

// ==================== VERIFY OTP (KHÔNG CÒN DÙNG) ====================
// Giữ lại để tránh lỗi nếu route vẫn còn, nhưng trả về thông báo
exports.verifyOtp = async (req, res) => {
  res.status(400).json({ 
    success: false, 
    message: 'Xác thực OTP không còn được sử dụng. Bạn có thể đăng nhập trực tiếp.' 
  });
};

// ==================== GET CURRENT USER ====================
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.address, u.is_active,
              GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let role = 'user';
    if (user.roles) {
      const rolesList = user.roles.split(',');
      role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        role: role,
        is_active: user.is_active === 1
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
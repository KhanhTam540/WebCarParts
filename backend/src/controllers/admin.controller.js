const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==================== DASHBOARD STATISTICS ====================

// GET /api/v1/admin/dashboard/stats - Lấy tất cả thống kê cho dashboard
const getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Tính khoảng thời gian
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // 1. Thống kê tổng quan
    const [overview] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= ?) as new_users,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE order_date >= ?) as new_orders,
        (SELECT COUNT(*) FROM parts) as total_products,
        (SELECT SUM(stock_quantity) FROM parts) as total_stock,
        (SELECT COUNT(*) FROM parts WHERE stock_quantity = 0) as out_of_stock,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED')) as total_revenue,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date >= ?) as revenue_this_period,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('PAID', 'COMPLETED') AND order_date < ? AND order_date >= DATE_SUB(?, INTERVAL 1 DAY)) as revenue_previous_period
    `, [startDateStr, startDateStr, startDateStr, startDateStr, startDateStr]);

    // 2. Doanh thu theo ngày
    const [revenueByDate] = await db.query(`
      SELECT 
        DATE(order_date) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status IN ('PAID', 'COMPLETED')
        AND order_date >= ?
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `, [startDateStr]);

    // 3. Phân bố trạng thái đơn hàng
    const [orderStatus] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total
      FROM orders
      GROUP BY status
    `);

    // 4. Sản phẩm bán chạy
    const [bestSelling] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        c.name as category_name,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
      FROM order_items oi
      JOIN parts p ON oi.part_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('PAID', 'COMPLETED')
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // 5. Thống kê người dùng mới theo ngày
    const [newUsersByDate] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startDateStr]);

    // 6. Thống kê theo danh mục
    const [categoryStats] = await db.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.quantity), 0) as items_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
      FROM categories c
      LEFT JOIN parts p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.part_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED')
      GROUP BY c.id
    `);

    // 7. Đơn hàng gần đây
    const [recentOrders] = await db.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.order_date,
        u.username,
        u.full_name,
        u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
      LIMIT 10
    `);

    // Tính phần trăm thay đổi
    const currentRevenue = parseFloat(overview[0].revenue_this_period) || 0;
    const previousRevenue = parseFloat(overview[0].revenue_previous_period) || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : currentRevenue > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          total_users: overview[0].total_users,
          new_users: overview[0].new_users,
          total_orders: overview[0].total_orders,
          new_orders: overview[0].new_orders,
          total_products: overview[0].total_products,
          total_stock: overview[0].total_stock,
          out_of_stock: overview[0].out_of_stock,
          total_revenue: overview[0].total_revenue,
          revenue_this_period: currentRevenue,
          revenue_change: revenueChange
        },
        revenue_by_date: revenueByDate,
        order_status: orderStatus,
        best_selling_products: bestSelling,
        new_users_by_date: newUsersByDate,
        category_stats: categoryStats,
        recent_orders: recentOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== DETAILED STATISTICS ====================

// GET /api/v1/admin/statistics/detailed - Lấy thống kê chi tiết
const getDetailedStatistics = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    // Mặc định lấy 30 ngày gần nhất nếu không có ngày
    const end = end_date ? new Date(end_date) : new Date();
    const start = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      start.setDate(start.getDate() - 30);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // 1. Tổng quan doanh thu
    const [revenueSummary] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value,
        MAX(total_amount) as max_order,
        MIN(total_amount) as min_order
      FROM orders
      WHERE status IN ('PAID', 'COMPLETED')
        AND order_date BETWEEN ? AND ?
    `, [startStr, endStr]);

    // 2. Doanh thu theo ngày/tuần/tháng
    let groupByClause = '';
    switch(group_by) {
      case 'day':
        groupByClause = 'DATE(order_date)';
        break;
      case 'week':
        groupByClause = 'YEARWEEK(order_date)';
        break;
      case 'month':
        groupByClause = 'DATE_FORMAT(order_date, "%Y-%m")';
        break;
      default:
        groupByClause = 'DATE(order_date)';
    }

    const [revenueByTime] = await db.query(`
      SELECT 
        ${groupByClause} as period,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status IN ('PAID', 'COMPLETED')
        AND order_date BETWEEN ? AND ?
      GROUP BY ${groupByClause}
      ORDER BY period DESC
    `, [startStr, endStr]);

    // 3. Thống kê theo sản phẩm
    const [productStats] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        c.name as category_name,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as total_quantity,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
      FROM parts p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.part_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_revenue DESC
    `, [startStr, endStr]);

    // 4. Thống kê theo danh mục
    const [categoryStats] = await db.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.quantity) as items_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
      FROM categories c
      LEFT JOIN parts p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.part_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
      GROUP BY c.id
      ORDER BY revenue DESC
    `, [startStr, endStr]);

    // 5. Thống kê theo khách hàng
    const [customerStats] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.email,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        MAX(o.order_date) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('PAID', 'COMPLETED') AND o.order_date BETWEEN ? AND ?
      GROUP BY u.id
      HAVING order_count > 0
      ORDER BY total_spent DESC
      LIMIT 20
    `, [startStr, endStr]);

    // 6. Thống kê theo thời gian trong ngày
    const [hourlyStats] = await db.query(`
      SELECT 
        HOUR(order_date) as hour,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status IN ('PAID', 'COMPLETED')
        AND order_date BETWEEN ? AND ?
      GROUP BY HOUR(order_date)
      ORDER BY hour
    `, [startStr, endStr]);

    // 7. Thống kê theo ngày trong tuần
    const [weekdayStats] = await db.query(`
      SELECT 
        DAYOFWEEK(order_date) as weekday,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status IN ('PAID', 'COMPLETED')
        AND order_date BETWEEN ? AND ?
      GROUP BY DAYOFWEEK(order_date)
      ORDER BY weekday
    `, [startStr, endStr]);

    // 8. Top sản phẩm bán chạy nhất
    const [topProducts] = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        c.name as category_name,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
      FROM order_items oi
      JOIN parts p ON oi.part_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('PAID', 'COMPLETED')
        AND o.order_date BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `, [startStr, endStr]);

    // 9. Khách hàng mới trong kỳ
    const [newCustomers] = await db.query(`
      SELECT 
        COUNT(*) as total,
        DATE(created_at) as date
      FROM users
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [startStr, endStr]);

    // 10. Tỷ lệ chuyển đổi (số người đặt hàng / tổng số người)
    const [conversionRate] = await db.query(`
      SELECT 
        (SELECT COUNT(DISTINCT user_id) FROM orders WHERE order_date BETWEEN ? AND ?) as buyers,
        (SELECT COUNT(*) FROM users WHERE created_at <= ?) as total_users
    `, [startStr, endStr, endStr]);

    res.json({
      success: true,
      data: {
        period: {
          start_date: startStr,
          end_date: endStr,
          group_by
        },
        summary: {
          total_orders: revenueSummary[0].total_orders,
          total_revenue: revenueSummary[0].total_revenue,
          avg_order_value: revenueSummary[0].avg_order_value,
          max_order: revenueSummary[0].max_order,
          min_order: revenueSummary[0].min_order
        },
        revenue_by_time: revenueByTime,
        product_stats: productStats,
        category_stats: categoryStats,
        customer_stats: customerStats,
        hourly_stats: hourlyStats,
        weekday_stats: weekdayStats,
        top_products: topProducts,
        new_customers: newCustomers,
        conversion_rate: {
          buyers: conversionRate[0].buyers || 0,
          total_users: conversionRate[0].total_users || 0,
          rate: conversionRate[0].total_users > 0 
            ? ((conversionRate[0].buyers || 0) / conversionRate[0].total_users * 100).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get detailed statistics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== USER MANAGEMENT ====================

// GET /api/v1/admin/users - Lấy danh sách users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.address, 
              u.is_active, u.created_at, GROUP_CONCAT(r.name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    
    // Xử lý role cho mỗi user
    const formattedUsers = users.map(user => {
      let role = 'user';
      if (user.roles) {
        const rolesList = user.roles.split(',');
        role = rolesList.includes('admin') ? 'admin' : rolesList[0] || 'user';
      }
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        is_active: user.is_active === 1 || user.is_active === true,
        created_at: user.created_at,
        role: role
      };
    });
    
    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/users - Thêm user mới
const createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, address, role } = req.body;
    
    // Kiểm tra username/email đã tồn tại chưa
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Tên đăng nhập hoặc email đã tồn tại' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Thêm user
    const [result] = await db.query(
      `INSERT INTO users (username, password, email, full_name, phone, address, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, hashedPassword, email, full_name || null, phone || null, address || null]
    );
    
    const userId = result.insertId;
    
    // Thêm role
    const roleId = role === 'admin' ? 1 : 2;
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, roleId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Thêm người dùng thành công',
      data: { id: userId, username, email, role }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/users/:id - Cập nhật user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, role, is_active } = req.body;
    
    // Cập nhật thông tin user
    await db.query(
      `UPDATE users SET full_name = ?, phone = ?, address = ?, is_active = ? WHERE id = ?`,
      [full_name || null, phone || null, address || null, is_active, id]
    );
    
    // Cập nhật role nếu có
    if (role) {
      // Xóa role cũ
      await db.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
      
      // Thêm role mới
      const roleId = role === 'admin' ? 1 : 2;
      await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [id, roleId]
      );
    }
    
    res.json({ success: true, message: 'Cập nhật người dùng thành công' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/users/:id - Xóa user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra user có đơn hàng không?
    const [orders] = await db.query('SELECT id FROM orders WHERE user_id = ?', [id]);
    
    if (orders.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể xóa người dùng đã có đơn hàng' 
      });
    }
    
    // Xóa user (các bảng liên quan sẽ tự động xóa nhờ ON DELETE CASCADE)
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/users/:id/status - Khóa/Mở khóa user
const toggleUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const [result] = await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      message: is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản'
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/admin/stats/revenue?start_date=...&end_date=...
const getRevenueStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    let params = [];

    if (start_date && end_date) {
      dateFilter = 'AND o.order_date BETWEEN ? AND ?';
      params = [start_date, end_date];
    }

    // Total revenue
    const [totalRevenue] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue,
              COUNT(*) as total_orders
       FROM orders o
       WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}`,
      params
    );

    // Revenue by date
    const [revenueByDate] = await db.query(
      `SELECT DATE(o.order_date) as date,
              SUM(o.total_amount) as revenue,
              COUNT(*) as order_count
       FROM orders o
       WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
       GROUP BY DATE(o.order_date)
       ORDER BY date DESC`,
      params
    );

    // Best-selling parts
    const [bestSelling] = await db.query(
      `SELECT p.id, p.name, p.price,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price_at_purchase) as total_revenue
       FROM order_items oi
       JOIN parts p ON oi.part_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status IN ('PAID', 'COMPLETED') ${dateFilter}
       GROUP BY p.id, p.name, p.price
       ORDER BY total_sold DESC
       LIMIT 10`,
      params
    );

    // Order status breakdown
    const [statusBreakdown] = await db.query(
      `SELECT status, COUNT(*) as count
       FROM orders ${dateFilter ? 'WHERE order_date BETWEEN ? AND ?' : ''}
       GROUP BY status`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: totalRevenue[0],
        revenue_by_date: revenueByDate,
        best_selling_parts: bestSelling,
        order_status_breakdown: statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { 
  getDashboardStats,
  getDetailedStatistics,
  getAllUsers, 
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus, 
  getRevenueStats 
};
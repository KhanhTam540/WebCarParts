const db = require('../config/db');

// ==================== HELPER FUNCTIONS ====================

// Hàm format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Hàm tạo thông báo
const createNotification = async (connection, userId, type, title, message, data = {}) => {
  try {
    // Đảm bảo data là object trước khi stringify
    const safeData = data || {};
    const jsonData = JSON.stringify(safeData);
    
    await connection.query(
      `INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, FALSE, NOW())`,
      [userId, type, title, message, jsonData]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// ==================== USER ORDER FUNCTIONS ====================

// POST /api/v1/orders (create order from cart)
const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.query(
      `SELECT ci.id, ci.part_id, ci.quantity, p.price, p.stock_quantity, p.name
       FROM cart_items ci
       JOIN parts p ON ci.part_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Available: ${item.stock_quantity}, Requested: ${item.quantity}`
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [req.user.id, totalAmount, 'PENDING']
    );
    const orderId = orderResult.insertId;

    // Create order items + decrement stock
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, part_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.part_id, item.quantity, item.price]
      );
      await connection.query(
        'UPDATE parts SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.part_id]
      );
    }

    // Clear cart
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    // Tạo thông báo cho user
    await createNotification(
      connection,
      req.user.id,
      'order_created',
      'Đơn hàng đã được tạo',
      `Đơn hàng #${orderId} đã được tạo thành công với tổng giá trị ${formatCurrency(totalAmount)}`,
      { orderId }
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order_id: orderId, total_amount: totalAmount, status: 'PENDING' }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/orders (get user's orders)
const getOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT id, total_amount, status, order_date
       FROM orders WHERE user_id = ?
       ORDER BY order_date DESC`,
      [req.user.id]
    );

    // Get items for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name as part_name, p.image_url
         FROM order_items oi
         JOIN parts p ON oi.part_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/orders/:id (get order by id)
const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name as part_name, p.image_url
       FROM order_items oi
       JOIN parts p ON oi.part_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...orders[0], items }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==================== ADMIN ORDER FUNCTIONS ====================

// GET /api/v1/admin/orders - Lấy tất cả đơn hàng (Admin)
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.username, u.email, u.full_name, u.phone, u.address
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.order_date DESC`
    );

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name as part_name, p.image_url
         FROM order_items oi
         JOIN parts p ON oi.part_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin)
const updateOrderStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra status hợp lệ
    const validStatuses = ['PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: 'Trạng thái không hợp lệ' 
      });
    }

    // Kiểm tra đơn hàng tồn tại và lấy thông tin user
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    const order = orders[0];
    const oldStatus = order.status;

    // Cập nhật trạng thái
    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Tạo thông báo cho user dựa trên trạng thái mới
    let notificationType, notificationTitle, notificationMessage;
    
    switch (status) {
      case 'PAID':
        notificationType = 'order_confirmed';
        notificationTitle = 'Đơn hàng đã được xác nhận';
        notificationMessage = `Đơn hàng #${id} đã được xác nhận thanh toán. Chúng tôi sẽ sớm giao hàng cho bạn.`;
        break;
      case 'SHIPPING':
        notificationType = 'order_shipped';
        notificationTitle = 'Đơn hàng đang được giao';
        notificationMessage = `Đơn hàng #${id} đang được vận chuyển. Dự kiến giao trong 3-5 ngày.`;
        break;
      case 'COMPLETED':
        notificationType = 'order_delivered';
        notificationTitle = 'Đơn hàng đã giao thành công';
        notificationMessage = `Đơn hàng #${id} đã được giao thành công. Cảm ơn bạn đã mua sắm!`;
        break;
      case 'CANCELLED':
        notificationType = 'order_cancelled';
        notificationTitle = 'Đơn hàng đã bị hủy';
        notificationMessage = `Đơn hàng #${id} đã bị hủy. Vui lòng liên hệ hỗ trợ nếu cần thêm thông tin.`;
        break;
      default:
        notificationType = 'order_updated';
        notificationTitle = 'Đơn hàng đã được cập nhật';
        notificationMessage = `Đơn hàng #${id} đã được cập nhật trạng thái.`;
    }

    await createNotification(
      connection,
      order.user_id,
      notificationType,
      notificationTitle,
      notificationMessage,
      { orderId: id, oldStatus, newStatus: status }
    );

    // Log hoạt động
    console.log(`Order ${id} status updated from ${oldStatus} to ${status} by admin ${req.user.id}`);

    await connection.commit();
    connection.release();

    res.json({ 
      success: true, 
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: { order_id: id, status }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { 
  createOrder, 
  getOrders, 
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
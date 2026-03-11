const db = require('../config/db');

// GET /api/v1/wishlist - Lấy danh sách yêu thích
const getWishlist = async (req, res) => {
  try {
    console.log('📋 Fetching wishlist for user:', req.user.id);
    
    const [items] = await db.query(
      `SELECT w.id, w.part_id, w.created_at,
              p.name, p.price, p.description, p.image_url, p.stock_quantity,
              c.name as category_name
       FROM wishlist w
       JOIN parts p ON w.part_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      data: items 
    });
    
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// POST /api/v1/wishlist - Thêm vào yêu thích
const addToWishlist = async (req, res) => {
  try {
    const { part_id } = req.body;
    
    console.log('❤️ Adding to wishlist:', { userId: req.user.id, partId: part_id });
    
    // Kiểm tra sản phẩm tồn tại
    const [parts] = await db.query(
      'SELECT id, name FROM parts WHERE id = ?',
      [part_id]
    );
    
    if (parts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sản phẩm không tồn tại' 
      });
    }
    
    // Thêm vào wishlist
    const [result] = await db.query(
      'INSERT IGNORE INTO wishlist (user_id, part_id) VALUES (?, ?)',
      [req.user.id, part_id]
    );
    
    let wishlistId = null;
    if (result.insertId) {
      wishlistId = result.insertId;
    } else {
      // Nếu đã tồn tại, lấy id
      const [existing] = await db.query(
        'SELECT id FROM wishlist WHERE user_id = ? AND part_id = ?',
        [req.user.id, part_id]
      );
      if (existing.length > 0) {
        wishlistId = existing[0].id;
      }
    }
    
    // Đếm số lượng yêu thích hiện tại
    const [countResult] = await db.query(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
      [req.user.id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: { 
        id: wishlistId,
        part_id,
        wishlist_count: countResult[0].count
      }
    });
    
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// DELETE /api/v1/wishlist/:id - Xóa khỏi yêu thích
const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('💔 Removing from wishlist:', { userId: req.user.id, wishlistId: id });
    
    const [result] = await db.query(
      'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy sản phẩm trong danh sách yêu thích' 
      });
    }
    
    // Đếm số lượng yêu thích hiện tại
    const [countResult] = await db.query(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_id = ?',
      [req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
      data: { 
        wishlist_count: countResult[0].count 
      }
    });
    
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// DELETE /api/v1/wishlist - Xóa tất cả yêu thích
const clearWishlist = async (req, res) => {
  try {
    console.log('🗑️ Clearing wishlist for user:', req.user.id);
    
    await db.query(
      'DELETE FROM wishlist WHERE user_id = ?',
      [req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Đã xóa tất cả sản phẩm yêu thích'
    });
    
  } catch (error) {
    console.error('❌ Clear wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// GET /api/v1/wishlist/check/:partId - Kiểm tra sản phẩm đã yêu thích chưa
const checkWishlist = async (req, res) => {
  try {
    const { partId } = req.params;
    
    const [result] = await db.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND part_id = ?',
      [req.user.id, partId]
    );
    
    res.json({
      success: true,
      data: {
        is_favorite: result.length > 0,
        wishlist_id: result[0]?.id || null
      }
    });
    
  } catch (error) {
    console.error('❌ Check wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
};
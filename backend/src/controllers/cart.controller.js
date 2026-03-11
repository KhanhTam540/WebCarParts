const db = require('../config/db');

// GET /api/v1/cart/items
const getCartItems = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT ci.id, ci.quantity, p.id as part_id, p.name, p.price, p.stock_quantity, p.image_url,
              (ci.quantity * p.price) as subtotal
       FROM cart_items ci
       JOIN parts p ON ci.part_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({ success: true, data: { items, total } });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/cart/items
const addToCart = async (req, res) => {
  try {
    const { part_id, quantity = 1 } = req.body;

    // Check stock
    const [parts] = await db.query('SELECT stock_quantity, name FROM parts WHERE id = ?', [part_id]);
    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    if (parts[0].stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${parts[0].stock_quantity}` });
    }

    // Upsert cart item
    await db.query(
      `INSERT INTO cart_items (user_id, part_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, part_id, quantity]
    );

    res.status(201).json({ success: true, message: `Added ${parts[0].name} to cart` });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/cart/items/:id
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    // Get cart item and check stock
    const [items] = await db.query(
      `SELECT ci.part_id, p.stock_quantity
       FROM cart_items ci JOIN parts p ON ci.part_id = p.id
       WHERE ci.id = ? AND ci.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    if (items[0].stock_quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${items[0].stock_quantity}` });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/cart/items/:id
const removeCartItem = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCartItems, addToCart, updateCartItem, removeCartItem };

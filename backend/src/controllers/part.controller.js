const db = require('../config/db');

// GET /api/v1/parts/search?keyword=...&model_year_id=...&category_id=...&page=1&limit=10
const searchParts = async (req, res) => {
  try {
    const { keyword, model_year_id, category_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];

    if (keyword) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (model_year_id) {
      where.push('pc.model_year_id = ?');
      params.push(model_year_id);
    }

    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const joinClause = model_year_id
      ? 'JOIN part_compatibility pc ON p.id = pc.part_id'
      : 'LEFT JOIN part_compatibility pc ON p.id = pc.part_id';

    // Count total
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total FROM parts p ${joinClause} ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated results
    const [parts] = await db.query(
      `SELECT DISTINCT p.*, c.name as category_name
       FROM parts p
       JOIN categories c ON p.category_id = c.id
       ${joinClause}
       ${whereClause}
       ORDER BY p.name
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: parts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search parts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/parts/:id
const getPartById = async (req, res) => {
  try {
    const [parts] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }

    // Get compatible vehicles
    const [compatibility] = await db.query(
      `SELECT my.id as model_year_id, my.year, cm.name as model_name, b.name as brand_name
       FROM part_compatibility pc
       JOIN model_years my ON pc.model_year_id = my.id
       JOIN car_models cm ON my.model_id = cm.id
       JOIN brands b ON cm.brand_id = b.id
       WHERE pc.part_id = ?
       ORDER BY b.name, cm.name, my.year`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...parts[0], compatible_vehicles: compatibility }
    });
  } catch (error) {
    console.error('Get part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/parts
const createPart = async (req, res) => {
  try {
    const { category_id, name, description, price, stock_quantity, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO parts (category_id, name, description, price, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, stock_quantity, image_url]
    );
    res.status(201).json({
      success: true,
      message: 'Part created',
      data: { id: result.insertId, name, price, stock_quantity }
    });
  } catch (error) {
    console.error('Create part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/parts/:id
const updatePart = async (req, res) => {
  try {
    const { category_id, name, description, price, stock_quantity, image_url } = req.body;
    const [result] = await db.query(
      'UPDATE parts SET category_id = ?, name = ?, description = ?, price = ?, stock_quantity = ?, image_url = ? WHERE id = ?',
      [category_id, name, description, price, stock_quantity, image_url, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.json({ success: true, message: 'Part updated' });
  } catch (error) {
    console.error('Update part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/parts/:id
const deletePart = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM parts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    res.json({ success: true, message: 'Part deleted' });
  } catch (error) {
    console.error('Delete part error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/parts/:id/compatibility
const addCompatibility = async (req, res) => {
  try {
    const partId = req.params.id;
    const { model_year_ids } = req.body; // Array of model_year_id

    if (!Array.isArray(model_year_ids) || model_year_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'model_year_ids must be a non-empty array' });
    }

    const values = model_year_ids.map(myId => [partId, myId]);
    await db.query(
      'INSERT IGNORE INTO part_compatibility (part_id, model_year_id) VALUES ?',
      [values]
    );

    res.status(201).json({
      success: true,
      message: 'Compatibility added',
      data: { part_id: partId, model_year_ids }
    });
  } catch (error) {
    console.error('Add compatibility error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { searchParts, getPartById, createPart, updatePart, deletePart, addCompatibility };

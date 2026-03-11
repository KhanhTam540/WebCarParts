const db = require('../config/db');

// GET /api/v1/brands
const getAllBrands = async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM brands ORDER BY name');
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/brands/:id/models
const getModelsByBrand = async (req, res) => {
  try {
    const [models] = await db.query(
      'SELECT * FROM car_models WHERE brand_id = ? ORDER BY name',
      [req.params.id]
    );
    res.json({ success: true, data: models });
  } catch (error) {
    console.error('Get models by brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/admin/brands (admin)
const createBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    const [result] = await db.query(
      'INSERT INTO brands (name, country) VALUES (?, ?)',
      [name, country]
    );
    res.status(201).json({
      success: true,
      message: 'Brand created',
      data: { id: result.insertId, name, country }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Brand already exists' });
    }
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/v1/admin/brands/:id
const updateBrand = async (req, res) => {
  try {
    const { name, country } = req.body;
    const [result] = await db.query(
      'UPDATE brands SET name = ?, country = ? WHERE id = ?',
      [name, country, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand updated' });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/v1/admin/brands/:id
const deleteBrand = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllBrands, getModelsByBrand, createBrand, updateBrand, deleteBrand };

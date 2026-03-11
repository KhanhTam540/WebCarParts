const db = require('../config/db');

// GET /api/v1/years/:id/compatibility
const getCompatibleParts = async (req, res) => {
  try {
    const [parts] = await db.query(
      `SELECT p.*, c.name as category_name
       FROM parts p
       JOIN part_compatibility pc ON p.id = pc.part_id
       JOIN categories c ON p.category_id = c.id
       WHERE pc.model_year_id = ?
       ORDER BY p.name`,
      [req.params.id]
    );
    res.json({ success: true, data: parts });
  } catch (error) {
    console.error('Get compatible parts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCompatibleParts };

const express = require('express');
const router = express.Router();
const { searchParts, getPartById } = require('../controllers/part.controller');

// GET /api/v1/parts/search
router.get('/search', searchParts);

// GET /api/v1/parts/:id
router.get('/:id', getPartById);

module.exports = router;

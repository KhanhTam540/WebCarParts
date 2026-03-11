const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
} = require('../controllers/wishlist.controller');

// All wishlist routes require authentication
router.use(verifyToken);

// GET routes
router.get('/', getWishlist);
router.get('/check/:partId', checkWishlist);

// POST routes
router.post('/', [
  body('part_id').isInt().withMessage('ID sản phẩm không hợp lệ'),
  validate
], addToWishlist);

// DELETE routes
router.delete('/:id', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
require('./src/config/db');

// Routes
app.use('/api/v1/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/user', require('./src/routes/user.routes'));
app.use('/api/v1/brands', require('./src/routes/brand.routes'));
app.use('/api/v1/models', require('./src/routes/model.routes'));
app.use('/api/v1/years', require('./src/routes/year.routes'));
app.use('/api/v1/categories', require('./src/routes/category.routes'));
app.use('/api/v1/parts', require('./src/routes/part.routes'));
app.use('/api/v1/cart', require('./src/routes/cart.routes'));
app.use('/api/v1/orders', require('./src/routes/order.routes'));
app.use('/api/v1/admin', require('./src/routes/admin.routes'));
app.use('/api/v1/notifications', require('./src/routes/notification.routes'));
app.use('/api/v1/wishlist', require('./src/routes/wishlist.routes')); // THÊM DÒNG NÀY

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Car Parts API is running 🚗' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
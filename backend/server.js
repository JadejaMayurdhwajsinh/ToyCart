const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables BEFORE importing anything that reads process.env
dotenv.config();

// Import database connection (models/sequelize use process.env at import-time)
const { connectDB } = require('./config/db');

// Import routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./utils/errorHandler');
const categoryRoutes = require('./routes/category');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use('/api/categories', categoryRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));



// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== API ROUTES ==========

// User routes (authentication & profile)
app.use('/api/users', userRoutes);

// Product routes (catalog)
app.use('/api/products', productRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Wishlist routes
app.use('/api/wishlist', wishlistRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// ========== ERROR HANDLING ==========

// 404 handler - must be before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware - must be last
app.use(errorHandler);

// ========== START SERVER ==========
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected and synced');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 ToyCart API Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
      console.log('\n📌 Available endpoints:');
      console.log('   GET    /api/health - Health check');
      console.log('   POST   /api/users/register - Register');
      console.log('   POST   /api/users/login - Login');
      console.log('   GET    /api/products - Get all products');
      console.log('   POST   /api/cart - Add to cart');
      console.log('   POST   /api/orders - Place order');
      console.log('   GET    /api/admin/... - Admin panel (requires admin role)');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
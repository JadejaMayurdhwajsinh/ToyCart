const express = require('express');
const { Op } = require('sequelize');
const { User, Product, Order, OrderItem, Category, Review } = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { AppError } = require('../utils/errorHandler');

const router = express.Router();

// Apply auth and admin check to all routes
router.use(authMiddleware, adminMiddleware);

// ========== ADMIN DASHBOARD ==========
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    // Total revenue (delivered orders)
    const totalRevenue = await Order.sum('total_amount', {
      where: { status: 'delivered' }
    }) || 0;

    // Total customers
    const totalCustomers = await User.count({
      where: { role: 'customer' }
    });

    // Total products
    const totalProducts = await Product.count();

    // Total orders
    const totalOrders = await Order.count();

    // Orders by status
    const ordersByStatus = await Order.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCustomers,
        totalProducts,
        totalOrders,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET ALL CUSTOMERS ==========
router.get('/customers', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = { role: 'customer' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      customers: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET CUSTOMER DETAILS ==========
router.get('/customers/:userId', async (req, res, next) => {
  try {
    const customer = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!customer || customer.role !== 'customer') {
      return next(new AppError('Customer not found', 404));
    }

    // Get customer orders
    const orders = await Order.findAll({
      where: { userId: customer.id },
      include: [{ model: OrderItem }]
    });

    res.json({
      success: true,
      customer,
      orders,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
    });
  } catch (error) {
    next(error);
  }
});

// ========== DELETE CUSTOMER ==========
router.delete('/customers/:userId', async (req, res, next) => {
  try {
    const customer = await User.findByPk(req.params.userId);

    if (!customer || customer.role !== 'customer') {
      return next(new AppError('Customer not found', 404));
    }

    // Get all orders for this customer to check status
    const orders = await Order.findAll({
      where: { userId: customer.id, status: { [Op.notIn]: ['delivered', 'cancelled'] } }
    });

    if (orders.length > 0) {
      return next(new AppError('Cannot delete customer with pending or active orders. Please cancel/complete all orders first.', 400));
    }

    // Delete the customer
    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET ALL ORDERS ==========
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const where = {};
    if (status) where.status = status;

    let userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: User,
        where: search ? userWhere : {},
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      orders: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET ORDER DETAILS ==========
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'image_url'] }] }
      ]
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// ========== UPDATE ORDER STATUS ==========
router.put('/orders/:orderId/status', async (req, res, next) => {
  try {
    const { status, shipping_date, delivery_date, tracking_number } = req.body;

    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return next(new AppError('Invalid order status', 400));
    }

    await order.update({
      status: status || order.status,
      shipping_date: shipping_date || order.shipping_date,
      delivery_date: delivery_date || order.delivery_date,
      tracking_number: tracking_number || order.tracking_number
    });

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET ALL PRODUCTS ==========
router.get('/products', async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, search, availability } = req.query;

    const where = {};
    if (category) where.categoryId = category;
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (availability) where.availability = availability;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      products: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET LOW STOCK PRODUCTS ==========
router.get('/products/low-stock/alerts', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { stock: { [Op.lt]: 5 } },
      include: [{ model: Category }],
      order: [['stock', 'ASC']],
      limit: 20
    });

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET ALL CATEGORIES ==========
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, attributes: ['id'], required: false }],
      order: [['name', 'ASC']]
    });

    const result = categories.map(cat => ({
      ...cat.toJSON(),
      productCount: cat.Products.length
    }));

    res.json({
      success: true,
      categories: result
    });
  } catch (error) {
    next(error);
  }
});

// ========== CREATE CATEGORY ==========
router.post('/categories', async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return next(new AppError('Category name required', 400));
    }

    const category = await Category.create({ name, description, image_url });

    res.status(201).json({
      success: true,
      message: 'Category created',
      category
    });
  } catch (error) {
    next(error);
  }
});

// ========== SALES REPORT ==========
router.get('/reports/sales', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { status: 'delivered' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const orders = await Order.findAll({
      where,
      attributes: ['id', 'total_amount', 'createdAt'],
      raw: true
    });

    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    res.json({
      success: true,
      report: {
        periodStart: startDate || 'All time',
        periodEnd: endDate || 'All time',
        totalOrders: orders.length,
        totalSales: parseFloat(totalSales.toFixed(2)),
        averageOrderValue: orders.length > 0 ? parseFloat((totalSales / orders.length).toFixed(2)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

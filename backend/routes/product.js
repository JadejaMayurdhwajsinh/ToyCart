const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Review, User } = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { AppError } = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// ========== GET ALL PRODUCTS (WITH FILTERS) ==========
router.get('/', async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      sort = 'newest', 
      page = 1, 
      limit = 12,
      featured
    } = req.query;

    const where = {};

    // Category filter
    if (category) where.categoryId = category;

    // Search by name/description
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Featured products only
    if (featured === 'true') where.is_featured = true;

    // Availability filter
    where.availability = { [Op.ne]: 'discontinued' };

    // Sorting
    const order = [];
    switch (sort) {
      case 'price_asc':
        order.push(['price', 'ASC']);
        break;
      case 'price_desc':
        order.push(['price', 'DESC']);
        break;
      case 'rating':
        order.push(['rating', 'DESC']);
        break;
      case 'newest':
      default:
        order.push(['createdAt', 'DESC']);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      products: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET FEATURED PRODUCTS ==========
router.get('/featured/all', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { 
        is_featured: true,
        availability: { [Op.ne]: 'discontinued' }
      },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['rating', 'DESC']],
      limit: 8
    });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET PRODUCT DETAILS ==========
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
});

// ========== CREATE PRODUCT (ADMIN) ==========
router.post('/', authMiddleware, adminMiddleware, uploadSingle('image'), async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      short_description, 
      price, 
      categoryId, 
      stock, 
      is_featured 
    } = req.body;

    // Validations
    if (!name || !price || !categoryId || stock === undefined) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log('Error deleting file:', err);
        });
      }
      return next(new AppError('Please fill all required fields', 400));
    }

    if (parseFloat(price) <= 0) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log('Error deleting file:', err);
        });
      }
      return next(new AppError('Price must be greater than 0', 400));
    }

    // Check category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log('Error deleting file:', err);
        });
      }
      return next(new AppError('Category not found', 404));
    }

    // Build image_url from uploaded file
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      short_description,
      price: parseFloat(price),
      categoryId,
      image_url: image_url,
      additional_images: [],
      stock: parseInt(stock),
      is_featured: is_featured === 'true' || is_featured === true,
      availability: parseInt(stock) > 0 ? 'in_stock' : 'out_of_stock'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting file:', err);
      });
    }
    next(error);
  }
});

// ========== UPDATE PRODUCT (ADMIN) ==========
router.put('/:id', authMiddleware, adminMiddleware, uploadSingle('image'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, price, categoryId, stock, is_featured } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log('Error deleting file:', err);
        });
      }
      return next(new AppError('Product not found', 404));
    }

    // Update availability based on stock
    const updateData = {
      name: name || product.name,
      description: description || product.description,
      short_description: short_description || product.short_description,
      price: price || product.price,
      categoryId: categoryId || product.categoryId,
      is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true) : product.is_featured
    };

    // Handle image update
    if (req.file) {
      // Delete old image if it exists
      if (product.image_url && product.image_url.startsWith('/uploads/products/')) {
        const oldImagePath = path.join(__dirname, '../' + product.image_url);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.log('Error deleting old image:', err);
        });
      }
      updateData.image_url = `/uploads/products/${req.file.filename}`;
    }

    if (stock !== undefined) {
      updateData.stock = parseInt(stock);
      updateData.availability = parseInt(stock) > 0 ? 'in_stock' : 'out_of_stock';
    }

    await product.update(updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.log('Error deleting file:', err);
      });
    }
    next(error);
  }
});

// ========== DELETE PRODUCT (ADMIN) ==========
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Delete product image if it exists
    if (product.image_url && product.image_url.startsWith('/uploads/products/')) {
      const imagePath = path.join(__dirname, '../' + product.image_url);
      fs.unlink(imagePath, (err) => {
        if (err) console.log('Error deleting image file:', err);
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return next(new AppError('Cannot delete product with existing orders', 400));
    }
    next(error);
  }
});

// ========== GET PRODUCT BY CATEGORY ==========
router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Product.findAndCountAll({
      where: { 
        categoryId,
        availability: { [Op.ne]: 'discontinued' }
      },
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      category,
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

module.exports = router;
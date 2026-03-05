const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Review, User } = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { uploadSingle, uploadProductImages } = require('../middleware/upload'); // ← added uploadProductImages
const { AppError } = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// ── Helper: delete a file from disk safely ──
const deleteFile = (filePath) => {
  if (filePath && filePath.startsWith('/uploads/products/')) {
    const fullPath = path.join(__dirname, '../' + filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.log('Error deleting file:', err);
    });
  }
};

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

    if (category) where.categoryId = category;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (featured === 'true') where.is_featured = true;

    where.availability = { [Op.ne]: 'discontinued' };

    const order = [];
    switch (sort) {
      case 'price_asc':  order.push(['price', 'ASC']);     break;
      case 'price_desc': order.push(['price', 'DESC']);    break;
      case 'rating':     order.push(['rating', 'DESC']);   break;
      case 'newest':
      default:           order.push(['createdAt', 'DESC']);
    }

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

    res.json({ success: true, products });
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

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// ========== CREATE PRODUCT (ADMIN) ==========
// Changed: uploadSingle → uploadProductImages to support additional_images
router.post('/', authMiddleware, adminMiddleware, uploadProductImages(), async (req, res, next) => {
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
      if (req.files?.image?.[0])             deleteFile(`/uploads/products/${req.files.image[0].filename}`);
      if (req.files?.additional_images)      req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
      return next(new AppError('Please fill all required fields', 400));
    }

    if (parseFloat(price) <= 0) {
      if (req.files?.image?.[0])             deleteFile(`/uploads/products/${req.files.image[0].filename}`);
      if (req.files?.additional_images)      req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
      return next(new AppError('Price must be greater than 0', 400));
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      if (req.files?.image?.[0])             deleteFile(`/uploads/products/${req.files.image[0].filename}`);
      if (req.files?.additional_images)      req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
      return next(new AppError('Category not found', 404));
    }

    // Main image
    let image_url = null;
    if (req.files?.image?.[0]) {
      image_url = `/uploads/products/${req.files.image[0].filename}`;
    }

    // Additional images → save as JSON array of paths
    let additional_images = [];
    if (req.files?.additional_images) {
      additional_images = req.files.additional_images.map(f => `/uploads/products/${f.filename}`);
    }

    const product = await Product.create({
      name,
      description,
      short_description,
      price: parseFloat(price),
      categoryId,
      image_url,
      additional_images,   // saved as JSON array in DB
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
    if (req.files?.image?.[0])        deleteFile(`/uploads/products/${req.files.image[0].filename}`);
    if (req.files?.additional_images) req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
    next(error);
  }
});

// ========== UPDATE PRODUCT (ADMIN) ==========
// Changed: uploadSingle → uploadProductImages to support additional_images
router.put('/:id', authMiddleware, adminMiddleware, uploadProductImages(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, price, categoryId, stock, is_featured, keep_additional_images } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      if (req.files?.image?.[0])             deleteFile(`/uploads/products/${req.files.image[0].filename}`);
      if (req.files?.additional_images)      req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
      return next(new AppError('Product not found', 404));
    }

    const updateData = {
      name:              name              || product.name,
      description:       description       || product.description,
      short_description: short_description || product.short_description,
      price:             price             || product.price,
      categoryId:        categoryId        || product.categoryId,
      is_featured: is_featured !== undefined
        ? (is_featured === 'true' || is_featured === true)
        : product.is_featured,
    };

    // ── Main image update ──
    if (req.files?.image?.[0]) {
      deleteFile(product.image_url); // delete old main image
      updateData.image_url = `/uploads/products/${req.files.image[0].filename}`;
    }

    // ── Additional images update ──
    // keep_additional_images = JSON array of existing paths to keep (sent from frontend)
    let keptImages = [];
    if (keep_additional_images) {
      try {
        keptImages = JSON.parse(keep_additional_images);
      } catch {
        keptImages = [];
      }
    }

    // Delete any old additional images that are NOT being kept
    const oldAdditional = Array.isArray(product.additional_images) ? product.additional_images : [];
    oldAdditional.forEach((imgPath) => {
      if (!keptImages.includes(imgPath)) {
        deleteFile(imgPath);
      }
    });

    // New uploaded additional images
    let newAdditionalImages = [];
    if (req.files?.additional_images) {
      newAdditionalImages = req.files.additional_images.map(f => `/uploads/products/${f.filename}`);
    }

    // Merge: kept existing + newly uploaded (max 4 total)
    updateData.additional_images = [...keptImages, ...newAdditionalImages].slice(0, 3);

    // ── Stock / availability ──
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
    if (req.files?.image?.[0])        deleteFile(`/uploads/products/${req.files.image[0].filename}`);
    if (req.files?.additional_images) req.files.additional_images.forEach(f => deleteFile(`/uploads/products/${f.filename}`));
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

    // Delete main image
    deleteFile(product.image_url);

    // Delete all additional images
    const additional = Array.isArray(product.additional_images) ? product.additional_images : [];
    additional.forEach((imgPath) => deleteFile(imgPath));

    await product.destroy();

    res.json({ success: true, message: 'Product deleted successfully' });
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

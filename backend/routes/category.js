const express = require('express');
const { Category } = require('../config/db');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const { AppError } = require('../utils/errorHandler');

// Verify JWT Token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new AppError('User not found', 401));
    } 

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check Admin Role
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

// Check Customer Role
const customerMiddleware = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return next(new AppError('Customer access required', 403));
  }
  next();
};

// Optional Auth (allows non-authenticated access)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  customerMiddleware,
  optionalAuth
};

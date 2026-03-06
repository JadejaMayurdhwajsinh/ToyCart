const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const { sequelize } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { AppError } = require('../utils/errorHandler');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// ========== REGISTER ==========
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, role = 'customer' } = req.body;

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      return next(new AppError('Please fill all fields', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validations
    if (!email || !password) {
      return next(new AppError('Email and password required', 400));
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// ========== GET PROFILE ==========
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// ========== UPDATE PROFILE ==========
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, address, city, state, zipcode, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    await user.update({
      name: name || user.name,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      zipcode: zipcode || user.zipcode,
      phone: phone || user.phone
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/profile/avatar', authMiddleware, uploadSingle('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const user = await User.findByPk(req.user.id);
    const avatarUrl = `/uploads/products/${req.file.filename}`;

    await user.update({ avatar: avatarUrl });

    res.json({
      success: true,
      message: 'Profile image updated',
      avatar: avatarUrl
    });
  } catch (error) {
    next(error);
  }
});


// ========== CHANGE PASSWORD ==========
router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Please fill all password fields', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('New passwords do not match', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ── Email transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ========== FORGOT PASSWORD ==========
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const user = await User.findOne({ where: { email } });
    // Always return success even if user not found (security)
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ resetToken, resetTokenExpiry });

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"ToyCart" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🧸 Reset your ToyCart password',
      html: `
        <div style="font-family: Poppins, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f5ff; border-radius: 16px;">
          <h2 style="color: #255F83; font-size: 24px; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #255F83; font-size: 15px; margin-bottom: 24px;">
            Hi ${user.name}, click the button below to reset your ToyCart password. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #255F83; color: #F7FFB4; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Reset Password
          </a>
          <p style="color: #7a8aaa; font-size: 13px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

// ========== RESET PASSWORD ==========
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return next(new AppError('All fields are required', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Find user with valid token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }, // token not expired
      },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset link. Please request a new one.', 400));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear token
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
});


module.exports = router;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ── Existing: single image upload (UNCHANGED) ──
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ success: false, message: 'File upload failed: ' + err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed: ' + err.message });
      }
      next();
    });
  };
};

// ── NEW: handles main image + up to 3 additional_images ──
const uploadProductImages = () => {
  return (req, res, next) => {
    upload.fields([
      { name: 'image',             maxCount: 1 },
      { name: 'additional_images', maxCount: 3 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 5MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: 'Maximum 3 additional images allowed' });
        }
        return res.status(400).json({ success: false, message: 'File upload failed: ' + err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: 'File upload failed: ' + err.message });
      }
      next();
    });
  };
};

module.exports = { uploadSingle, uploadProductImages };

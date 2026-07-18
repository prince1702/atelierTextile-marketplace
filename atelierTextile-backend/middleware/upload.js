const multer = require('multer');
const path = require('path');

// Use memory storage so we can pipe buffers directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'designFile') {
    const allowedExts = ['.zip', '.rar'];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP and RAR archive files are allowed for the design file'), false);
    }
  } else {
    const allowedExts = ['.jpeg', '.jpg', '.png', '.webp', '.svg'];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp, svg) are allowed for the pattern image'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
});

module.exports = upload;

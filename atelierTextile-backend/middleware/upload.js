const multer = require('multer');
const path = require('path');

// Use memory storage so we can pipe buffers directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'designFile') {
    const allowedExts = ['.zip', '.rar', '.emb', '.dst', '.bmp', '.psd', '.tif', '.tiff', '.pdc', '.7z'];
    if (allowedExts.includes(ext) || ext === '') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP, RAR, or valid design archive files are allowed for the main design file'), false);
    }
  } else if (file.fieldname === 'pdcDesignFile') {
    const allowedExts = ['.zip', '.rar', '.pdc', '.tif', '.tiff', '.7z'];
    if (allowedExts.includes(ext) || ext === '') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP, RAR, PDC, or TIF files are allowed for the PDC/TIF design file'), false);
    }
  } else {
    const allowedExts = ['.jpeg', '.jpg', '.png', '.webp', '.svg'];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp, svg) are allowed for display images'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max
  },
});

module.exports = upload;

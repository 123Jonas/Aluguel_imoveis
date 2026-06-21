const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError('Apenas imagens são permitidas.', 400), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const processPropertyImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  try {
    const results = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.buffer, 'boa-estadia/properties'))
    );
    req.cloudinaryImages = results.map(r => ({ url: r.secure_url, publicId: r.public_id }));
    next();
  } catch {
    next(new AppError('Erro ao fazer upload das imagens.', 500));
  }
};

const deleteFromCloudinary = (publicId) => cloudinary.uploader.destroy(publicId);

module.exports = { uploadFields: upload.array('images', 5), processPropertyImages, deleteFromCloudinary };

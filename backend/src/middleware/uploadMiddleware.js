const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    // Cria o diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Aceita apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

// Configuração do upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Middleware para upload de múltiplas imagens
const uploadImages = upload.array('images', 10); // Máximo de 10 imagens

// Middleware para upload de uma única imagem
const uploadImage = upload.single('image');

// Middleware para tratamento de erros do multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'O arquivo é muito grande. O tamanho máximo permitido é 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Muitos arquivos. O máximo permitido é 10 imagens.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next();
};

// Middleware para remover arquivos antigos
const removeOldFiles = (files) => {
  if (!files) return;
  
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach(file => {
    if (file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Erro ao remover arquivo:', err);
        }
      });
    }
  });
};

module.exports = {
  uploadImages,
  uploadImage,
  handleMulterError,
  removeOldFiles
}; 
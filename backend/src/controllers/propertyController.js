const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório de uploads existe
const uploadDir = 'uploads/properties';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas!'));
  }
}).array('images', 5);

// Middleware para upload de imagens
exports.uploadImages = (req, res, next) => {
  console.log('Starting image upload middleware');
  console.log('Request files:', req.files);
  console.log('Request body:', req.body);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({
        status: 'error',
        message: 'Erro no upload de imagens: ' + err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    console.log('Upload successful');
    console.log('Uploaded files:', req.files);
    next();
  });
};

// Criar um novo imóvel
exports.createProperty = async (req, res) => {
  try {
    console.log('Creating property with data:', {
      body: req.body,
      files: req.files,
      user: req.user
    });

    const {
      title,
      description,
      price,
      location,
      address,
      bedrooms,
      bathrooms,
      area,
      type,
      status,
      features
    } = req.body;

    // Processar as imagens
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        console.log('Processing file:', file);
        return file.path.replace(/\\/g, '/');
      });
    }
    console.log('Processed images:', images);

    // Criar o imóvel
    const property = await Property.create({
      title,
      description,
      price: Number(price),
      location,
      address,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      type,
      status,
      features: JSON.parse(features || '[]'),
      images,
      landlord: req.user._id
    });

    console.log('Property created successfully:', property);

    res.status(201).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Erro ao criar imóvel:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao criar imóvel'
    });
  }
};

// Obter todos os imóveis do proprietário
exports.getLandlordProperties = async (req, res) => {
  try {
    console.log('Getting properties for landlord:', {
      userId: req.user._id,
      userType: req.user.userType
    });

    const properties = await Property.find({ landlord: req.user._id });
    console.log('Found properties:', properties);

    res.status(200).json({
      status: 'success',
      data: {
        properties
      }
    });
  } catch (error) {
    console.error('Error getting landlord properties:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter um imóvel específico
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Imóvel não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar um imóvel
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Imóvel não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário do imóvel
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para atualizar este imóvel'
      });
    }

    // Processar as imagens
    const images = req.files ? req.files.map(file => file.path) : property.images;

    // Atualizar o imóvel
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images,
        features: req.body.features ? JSON.parse(req.body.features) : property.features
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        property: updatedProperty
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Excluir um imóvel
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Imóvel não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário do imóvel
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para excluir este imóvel'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 
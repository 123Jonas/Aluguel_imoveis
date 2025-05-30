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
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/properties';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Apenas JPEG, JPG e PNG são permitidos.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Máximo de 5 imagens
  }
});

// Middleware para upload de imagens
exports.uploadImages = upload.array('images', 5);

// Função para processar imagens
const processImages = (files, existingImages = []) => {
  const newImages = files ? files.map(file => `/uploads/properties/${file.filename}`) : [];
  return [...existingImages, ...newImages];
};

// Criar propriedade
exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, location, address, bedrooms, bathrooms, area, type, status, features } = req.body;
    
    // Processar imagens
    const images = processImages(req.files);

    // Criar propriedade
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
      landlord: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Erro ao criar propriedade:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao criar propriedade'
    });
  }
};

// Atualizar propriedade
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, address, bedrooms, bathrooms, area, type, status, features, existingImages } = req.body;

    // Verificar se a propriedade existe
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    // Verificar se o usuário é o proprietário
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para editar esta propriedade'
      });
    }

    // Processar imagens
    const newImages = processImages(req.files, JSON.parse(existingImages || '[]'));

    // Atualizar propriedade
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      {
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
        images: newImages
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        property: updatedProperty
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar propriedade:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao atualizar propriedade'
    });
  }
};

// Obter propriedade
exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate('landlord', 'name email');

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        property
      }
    });
  } catch (error) {
    console.error('Erro ao obter propriedade:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao obter propriedade'
    });
  }
};

// Listar propriedades
exports.getProperties = async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, location } = req.query;
    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('landlord', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    console.error('Erro ao listar propriedades:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao listar propriedades'
    });
  }
};

// Deletar propriedade
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    // Verificar se o usuário é o proprietário
    if (property.landlord.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para deletar esta propriedade'
      });
    }

    // Deletar imagens
    property.images.forEach(image => {
      const imagePath = path.join(__dirname, '../../', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await Property.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Erro ao deletar propriedade:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao deletar propriedade'
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

// Obter propriedades disponíveis
exports.getAvailableProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'available' })
      .populate('landlord', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Buscar propriedades
exports.searchProperties = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, location, bedrooms } = req.query;
    const query = { status: 'available' };

    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (location) query.location = new RegExp(location, 'i');
    if (bedrooms) query.bedrooms = Number(bedrooms);

    const properties = await Property.find(query)
      .populate('landlord', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar status de uma propriedade (apenas admin)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
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

// Obter todas as propriedades (apenas admin)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('landlord', 'name email phone');

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter todas as propriedades (pública)
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('landlord', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: {
        properties
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const User = require('../models/User');

// Obter propriedades do proprietário
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id })
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

// Criar nova propriedade
const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      landlord: req.user._id
    });

    res.status(201).json({
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

// Obter uma propriedade específica
const getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      landlord: req.user._id
    });

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

// Atualizar uma propriedade
const updateProperty = async (req, res) => {
  try {
    // Processar as imagens se houver novas
    let images = req.body.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Converter o caminho para URL relativa
        const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
        return `/uploads${relativePath}`;
      });
    }

    // Processar features se for uma string JSON
    let features = req.body.features;
    if (typeof features === 'string') {
      try {
      features = JSON.parse(features);
      } catch (error) {
        features = [];
      }
    }

    // Converter valores numéricos
    const updateData = {
      ...req.body,
      images,
      features,
      price: Number(req.body.price),
      bedrooms: Number(req.body.bedrooms),
      bathrooms: Number(req.body.bathrooms),
      area: Number(req.body.area)
    };

    // Remover campos undefined ou null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const property = await Property.findOneAndUpdate(
      {
        _id: req.params.id,
        landlord: req.user._id
      },
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('landlord', 'name email phone');

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
    console.error('Erro ao atualizar propriedade:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Erro ao atualizar propriedade'
    });
  }
};

// Deletar uma propriedade
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      landlord: req.user._id
    });

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

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

// Obter aluguéis das propriedades do proprietário
const getMyRentals = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const rentals = await Rental.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('tenant', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Aprovar aluguel
const approveRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário da propriedade
    const property = await Property.findById(rental.property);
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para aprovar este aluguel'
      });
    }

    // Atualizar status
    rental.status = 'active';
    rental.approvedAt = new Date();
    await rental.save();

    // Atualizar status da propriedade
    await Property.findByIdAndUpdate(rental.property, { status: 'rented' });

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Rejeitar aluguel
const rejectRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    // Verificar se o usuário é o proprietário da propriedade
    const property = await Property.findById(rental.property);
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para rejeitar este aluguel'
      });
    }

    // Atualizar status
    rental.status = 'rejected';
    await rental.save();

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter estatísticas do proprietário
const getMyStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ landlord: req.user._id });
    const propertiesByStatus = await Property.aggregate([
      {
        $match: { landlord: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const properties = await Property.find({ landlord: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const totalRentals = await Rental.countDocuments({ property: { $in: propertyIds } });
    const rentalsByStatus = await Rental.aggregate([
      {
        $match: { property: { $in: propertyIds } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalProperties,
        propertiesByStatus,
        totalRentals,
        rentalsByStatus
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter perfil do proprietário
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar perfil do proprietário
const updateProfile = async (req, res) => {
  try {
    // Filtrar campos que não são permitidos serem atualizados
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone');

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Função auxiliar para filtrar objetos
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = {
  getMyProperties,
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyRentals,
  approveRental,
  rejectRental,
  getMyStats,
  getProfile,
  updateProfile
}; 
const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');

// Obter aluguéis do inquilino
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ tenant: req.user._id })
      .populate('property')
      .populate('landlord', 'name email phone')
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

// Criar novo aluguel
const createRental = async (req, res) => {
  try {
    const property = await Property.findById(req.body.property);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    if (property.status !== 'available') {
      return res.status(400).json({
        status: 'error',
        message: 'Propriedade não está disponível para aluguel'
      });
    }

    const rental = await Rental.create({
      ...req.body,
      tenant: req.user._id,
      landlord: property.landlord,
      monthlyRent: property.price,
      securityDeposit: property.price * 2 // 2 meses de depósito
    });

    res.status(201).json({
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

// Obter um aluguel específico
const getRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      tenant: req.user._id
    })
    .populate('property')
    .populate('landlord', 'name email phone');

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

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

// Cancelar aluguel
const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      tenant: req.user._id
    });

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    if (rental.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Apenas aluguéis pendentes podem ser cancelados'
      });
    }

    rental.status = 'cancelled';
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

// Obter perfil do inquilino
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

// Atualizar perfil do inquilino
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

// Obter favoritos
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    
    res.status(200).json({
      status: 'success',
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Adicionar favorito
const addFavorite = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Propriedade já está nos favoritos'
      });
    }

    user.favorites.push(req.params.propertyId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Propriedade adicionada aos favoritos'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Remover favorito
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.favorites.includes(req.params.propertyId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Propriedade não está nos favoritos'
      });
    }

    user.favorites = user.favorites.filter(
      id => id.toString() !== req.params.propertyId
    );
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Propriedade removida dos favoritos'
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
  getMyRentals,
  createRental,
  getRental,
  cancelRental,
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite
}; 
const User = require('../models/User');
const Property = require('../models/Property');
const Rental = require('../models/Rental');

// Obter estatísticas gerais
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalRentals = await Rental.countDocuments();
    const activeRentals = await Rental.countDocuments({ status: 'active' });

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalProperties,
        totalRentals,
        activeRentals
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter estatísticas de usuários
const getUserStats = async (req, res) => {
  try {
    const usersByType = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        byType: usersByType,
        byMonth: usersByMonth
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter estatísticas de propriedades
const getPropertyStats = async (req, res) => {
  try {
    const propertiesByType = await Property.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const propertiesByStatus = await Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const propertiesByMonth = await Property.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        byType: propertiesByType,
        byStatus: propertiesByStatus,
        byMonth: propertiesByMonth
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter estatísticas de aluguéis
const getRentalStats = async (req, res) => {
  try {
    const rentalsByStatus = await Rental.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const rentalsByMonth = await Rental.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        byStatus: rentalsByStatus,
        byMonth: rentalsByMonth
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter um usuário específico
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

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

// Atualizar um usuário
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }

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

// Deletar um usuário
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
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

// Obter todas as propriedades
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate({
        path: 'landlord',
        select: 'name email phone'
      })
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

// Obter uma propriedade específica
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'name email phone');

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
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Deletar uma propriedade
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

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

// Obter todos os aluguéis
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
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

// Atualizar um aluguel
const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('property')
      .populate('tenant', 'name email phone');

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

// Deletar um aluguel
const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
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

module.exports = {
  getStats,
  getUserStats,
  getPropertyStats,
  getRentalStats,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getAllRentals,
  updateRental,
  deleteRental
}; 
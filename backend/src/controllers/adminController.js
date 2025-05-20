const User = require('../models/User');
const Property = require('../models/Property');
const RentalRequest = require('../models/RentalRequest');

// Obter estatísticas gerais
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalProperties, totalRequests] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      RentalRequest.countDocuments()
    ]);

    const usersByType = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    const requestsByStatus = await RentalRequest.aggregate([
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
        totalUsers,
        totalProperties,
        totalRequests,
        usersByType,
        requestsByStatus
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Listar todos os usuários
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
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

// Atualizar tipo de usuário
exports.updateUserType = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType, isAdmin } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { userType, isAdmin },
      { new: true, runValidators: true }
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

// Deletar usuário
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);

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
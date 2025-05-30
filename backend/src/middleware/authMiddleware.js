const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Middleware para proteger rotas
const protect = async (req, res, next) => {
  let token;

  // Verificar se o token está presente no header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter usuário do token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, token não fornecido' });
  }
};

// Restringir acesso a certos tipos de usuário
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }
    next();
  };
};

// Verificar se o usuário é o proprietário da propriedade
exports.isPropertyOwner = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada'
      });
    }

    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verificar se o usuário é o inquilino do aluguel
exports.isRentalTenant = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    if (rental.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verificar se o usuário é o proprietário do aluguel
exports.isRentalOwner = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('property');
    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    if (rental.property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verificar se o usuário é o dono da notificação
exports.isNotificationOwner = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notificação não encontrada'
      });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { protect, restrictTo }; 
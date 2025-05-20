const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  try {
    // 1) Verificar se o token existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Você não está logado. Por favor, faça login para ter acesso.'
      });
    }

    // 2) Verificar se o token é válido
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar se o usuário ainda existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário pertencente a este token não existe mais.'
      });
    }

    // 4) Verificar se o usuário mudou a senha após o token ser emitido
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário mudou a senha recentemente. Por favor, faça login novamente.'
      });
    }

    // Acesso concedido
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado. Por favor, faça login novamente.'
    });
  }
};

// Middleware para restringir acesso por tipo de usuário
exports.restrictTo = (...roles) => {
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
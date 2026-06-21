const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 3) Verificar se o usuário ainda existe
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário não existe mais.'
      });
    }

    // 4) Colocar o usuário na requisição
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType) && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }
    next();
  };
}; 
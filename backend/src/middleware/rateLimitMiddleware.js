const rateLimit = require('express-rate-limit');

// Limite geral para todas as rotas
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    status: 'error',
    message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos.'
  }
});

// Limite específico para autenticação
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Limite de 5 tentativas de login
  message: {
    status: 'error',
    message: 'Muitas tentativas de login, por favor tente novamente após 1 hora.'
  }
});

// Limite para criação de contas
const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // Limite de 3 contas por IP
  message: {
    status: 'error',
    message: 'Muitas contas criadas deste IP, por favor tente novamente após 24 horas.'
  }
});

// Limite para redefinição de senha
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Limite de 3 tentativas
  message: {
    status: 'error',
    message: 'Muitas tentativas de redefinição de senha, por favor tente novamente após 1 hora.'
  }
});

// Limite para upload de arquivos
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Limite de 20 uploads
  message: {
    status: 'error',
    message: 'Muitos uploads deste IP, por favor tente novamente após 1 hora.'
  }
});

// Limite para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições
  message: {
    status: 'error',
    message: 'Muitas requisições à API, por favor tente novamente após 15 minutos.'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  apiLimiter
}; 
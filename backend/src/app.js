require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Importar rotas
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const rentalRequestRoutes = require('./routes/rentalRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Conectar ao MongoDB
connectDB();

// Configuração do rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por windowMs
  message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
})); // Segurança de headers
app.use(morgan('dev')); // Logging
app.use(cors()); // Habilitar CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies com limite
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies com limite
app.use(limiter); // Aplicar rate limiting

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// Middleware para rotas não encontradas
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erros de cast do Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'ID inválido'
    });
  }

  // Erros de duplicação
  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Dados duplicados'
    });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Erro interno do servidor'
  });
});

module.exports = app; 
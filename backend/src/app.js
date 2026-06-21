require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const rentalRequestRoutes = require('./routes/rentalRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

connectDB();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Muitas requisições deste IP, tente novamente mais tarde.' }
});
app.use('/api', limiter);

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin')
}));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/properties/:propertyId/reviews', reviewRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ status: 'error', message: 'ID inválido' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ status: 'error', message: `${field} já está em uso` });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 'error', message: 'Token expirado, faça login novamente' });
  }

  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Erro interno do servidor'
  });
});

module.exports = app;

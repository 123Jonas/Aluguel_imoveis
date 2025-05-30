require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');
const Property = require('./models/Property');

// Importar rotas
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const rentalRequestRoutes = require('./routes/rentalRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Conectar ao MongoDB
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/notifications', notificationRoutes);

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware de autenticação do Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token não fornecido'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Usuário não encontrado'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Erro de autenticação'));
  }
});

// Gerenciar conexões Socket.IO
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.user.name);

  // Entrar em uma sala de chat
  socket.on('joinChat', async (chatId) => {
    socket.join(chatId);
    console.log(`Usuário ${socket.user.name} entrou no chat ${chatId}`);

    // Marcar mensagens como lidas
    await Message.updateMany(
      {
        chatId,
        receiverId: socket.user._id,
        read: false
      },
      {
        read: true
      }
    );
  });

  // Sair de uma sala de chat
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`Usuário ${socket.user.name} saiu do chat ${chatId}`);
  });

  // Enviar mensagem
  socket.on('sendMessage', async (data) => {
    const { chatId, message } = data;

    // Buscar informações do imóvel
    const property = await Property.findById(message.propertyId);
    if (!property) {
      return;
    }

    // Buscar informações do destinatário
    const receiver = await User.findById(message.receiverId);
    if (!receiver) {
      return;
    }

    // Enviar mensagem para todos na sala
    io.to(chatId).emit('newMessage', {
      ...message,
      propertyTitle: property.title,
      senderName: socket.user.name
    });
  });

  // Marcar mensagens como lidas
  socket.on('markAsRead', async (chatId) => {
    await Message.updateMany(
      {
        chatId,
        receiverId: socket.user._id,
        read: false
      },
      {
        read: true
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.user.name);
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 
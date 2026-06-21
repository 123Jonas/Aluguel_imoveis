require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const User = require('./models/User');
const Message = require('./models/Message');
const Property = require('./models/Property');

const server = http.createServer(app);

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

// Exportar io para uso nos controllers (notificações em tempo real)
app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token não fornecido'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('Usuário não encontrado'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Erro de autenticação'));
  }
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.user.name);

  // Cada utilizador entra automaticamente na sua sala pessoal para receber notificações
  socket.join(`user_${socket.user._id}`);

  socket.on('joinChat', async (chatId) => {
    socket.join(chatId);
    await Message.updateMany(
      { chatId, receiverId: socket.user._id, read: false },
      { read: true }
    );
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('sendMessage', async (data) => {
    const { chatId, message } = data;

    const property = await Property.findById(message.propertyId);
    if (!property) return;

    const savedMessage = await Message.create({
      chatId,
      senderId: socket.user._id,
      receiverId: message.receiverId,
      propertyId: message.propertyId,
      message: message.message
    });

    io.to(chatId).emit('newMessage', {
      ...savedMessage.toObject(),
      propertyTitle: property.title,
      senderName: socket.user.name
    });
  });

  socket.on('markAsRead', async (chatId) => {
    await Message.updateMany(
      { chatId, receiverId: socket.user._id, read: false },
      { read: true }
    );
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.user.name);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

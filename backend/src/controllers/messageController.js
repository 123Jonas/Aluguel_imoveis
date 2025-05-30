const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');

// Obter mensagens de um chat específico
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Buscar mensagens do chat
    const messages = await Message.find({ chatId })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('propertyId', 'title')
      .sort({ timestamp: 1 });

    // Verificar se o usuário tem acesso ao chat
    const hasAccess = messages.some(msg => 
      msg.senderId._id.toString() === userId.toString() || 
      msg.receiverId._id.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para acessar este chat'
      });
    }

    res.json({
      success: true,
      data: {
        messages
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar mensagens: ' + error.message
    });
  }
};

// Enviar uma nova mensagem
const sendMessage = async (req, res) => {
  try {
    const { chatId, receiverId, propertyId, message } = req.body;
    const senderId = req.user._id;

    // Validar campos obrigatórios
    if (!chatId || !receiverId || !propertyId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios: chatId, receiverId, propertyId e message'
      });
    }

    // Verificar se o destinatário existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Destinatário não encontrado'
      });
    }

    // Verificar se o imóvel existe
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Imóvel não encontrado'
      });
    }

    // Criar nova mensagem
    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      propertyId,
      message: message.trim(),
      timestamp: new Date(),
      read: false
    });

    await newMessage.save();

    // Popular os campos relacionados
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('propertyId', 'title');

    res.status(201).json({
      success: true,
      data: {
        message: populatedMessage
      }
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem: ' + error.message
    });
  }
};

// Obter conversas do inquilino
const getTenantConversations = async (req, res) => {
  try {
    const tenantId = req.user._id;

    // Buscar todas as mensagens do inquilino
    const messages = await Message.find({
      $or: [
        { senderId: tenantId },
        { receiverId: tenantId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('propertyId', 'title')
    .sort({ timestamp: -1 });

    // Agrupar mensagens por chatId
    const conversations = {};
    messages.forEach(message => {
      if (!conversations[message.chatId]) {
        const landlordId = message.senderId._id.toString() === tenantId.toString() 
          ? message.receiverId._id 
          : message.senderId._id;

        conversations[message.chatId] = {
          chatId: message.chatId,
          propertyId: message.propertyId._id,
          landlordId: landlordId,
          propertyTitle: message.propertyId.title,
          landlordName: message.senderId._id.toString() === tenantId.toString() 
            ? message.receiverId.name 
            : message.senderId.name,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unread: !message.read && message.receiverId._id.toString() === tenantId.toString(),
          messages: [message]
        };
      } else {
        conversations[message.chatId].messages.push(message);
        if (message.timestamp > conversations[message.chatId].timestamp) {
          conversations[message.chatId].lastMessage = message.message;
          conversations[message.chatId].timestamp = message.timestamp;
        }
      }
    });

    // Converter objeto para array e ordenar por timestamp
    const conversationsArray = Object.values(conversations).sort((a, b) => 
      b.timestamp - a.timestamp
    );

    res.json({
      success: true,
      data: {
        conversations: conversationsArray
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar conversas: ' + error.message
    });
  }
};

// Obter conversas do proprietário
const getLandlordConversations = async (req, res) => {
  try {
    const landlordId = req.user._id;

    // Buscar todas as mensagens do proprietário
    const messages = await Message.find({
      $or: [
        { senderId: landlordId },
        { receiverId: landlordId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .populate('propertyId', 'title')
    .sort({ timestamp: -1 });

    // Agrupar mensagens por chatId
    const conversations = {};
    messages.forEach(message => {
      if (!conversations[message.chatId]) {
        const tenantId = message.senderId._id.toString() === landlordId.toString() 
          ? message.receiverId._id 
          : message.senderId._id;

        conversations[message.chatId] = {
          chatId: message.chatId,
          propertyId: message.propertyId._id,
          tenantId: tenantId,
          propertyTitle: message.propertyId.title,
          tenantName: message.senderId._id.toString() === landlordId.toString() 
            ? message.receiverId.name 
            : message.senderId.name,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unread: !message.read && message.receiverId._id.toString() === landlordId.toString(),
          messages: [message]
        };
      } else {
        conversations[message.chatId].messages.push(message);
        if (message.timestamp > conversations[message.chatId].timestamp) {
          conversations[message.chatId].lastMessage = message.message;
          conversations[message.chatId].timestamp = message.timestamp;
        }
      }
    });

    // Converter objeto para array e ordenar por timestamp
    const conversationsArray = Object.values(conversations).sort((a, b) => 
      b.timestamp - a.timestamp
    );

    res.json({
      success: true,
      data: {
        conversations: conversationsArray
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar conversas: ' + error.message
    });
  }
};

// Marcar mensagens como lidas
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        chatId,
        receiverId: userId,
        read: false
      },
      {
        read: true
      }
    );

    res.json({
      success: true,
      message: 'Mensagens marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar mensagens como lidas: ' + error.message
    });
  }
};

module.exports = {
  getChatMessages,
  sendMessage,
  getTenantConversations,
  getLandlordConversations,
  markAsRead
}; 
const getLandlordConversations = async (req, res) => {
  try {
    const landlordId = req.user._id;

    // Buscar todas as mensagens onde o proprietário é o remetente ou destinatário
    const messages = await Message.find({
      $or: [
        { senderId: landlordId },
        { receiverId: landlordId }
      ]
    })
    .sort({ timestamp: -1 })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .populate('propertyId', 'title');

    // Agrupar mensagens por chatId
    const conversations = {};
    messages.forEach(message => {
      const chatId = message.chatId;
      if (!conversations[chatId]) {
        const otherUser = message.senderId._id.equals(landlordId) 
          ? message.receiverId 
          : message.senderId;

        conversations[chatId] = {
          chatId,
          propertyId: message.propertyId._id,
          propertyTitle: message.propertyId.title,
          tenantId: otherUser._id,
          tenantName: otherUser.name,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unread: !message.read && !message.senderId._id.equals(landlordId)
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        conversations: Object.values(conversations)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar conversas'
    });
  }
}; 
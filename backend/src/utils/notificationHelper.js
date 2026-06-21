const Notification = require('../models/Notification');

const sendNotification = async (app, { recipientId, senderId, type, title, message, relatedEntity, relatedEntityType }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedEntity,
      relatedEntityType
    });

    // Emitir via Socket.IO para entrega em tempo real
    const io = app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('newNotification', {
        _id: notification._id,
        type,
        title,
        message,
        read: false,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (err) {
    console.error('Erro ao criar notificação:', err.message);
  }
};

module.exports = { sendNotification };

const Notification = require('../models/Notification');

// Obter notificações do usuário
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Marcar notificação como lida
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notificação não encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Marcar todas as notificações como lidas
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Deletar uma notificação
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notificação não encontrada'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Deletar todas as notificações
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter contagem de notificações não lidas
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.status(200).json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
}; 
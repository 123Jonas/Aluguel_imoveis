const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

// Rota para buscar todas as notificações do usuário
router.get('/', notificationController.getUserNotifications);

// Rota para marcar uma notificação como lida
router.patch('/:id/read', notificationController.markNotificationAsRead);

// Rota para marcar todas as notificações como lidas
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

// Rota para deletar uma notificação
router.delete('/:id', notificationController.deleteNotification);

// Rota para deletar todas as notificações
router.delete('/', notificationController.deleteAllNotifications);

// Rota para obter o número de notificações não lidas
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router; 
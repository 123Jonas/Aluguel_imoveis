const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getChatMessages,
  getTenantConversations,
  getLandlordConversations,
  markAsRead
} = require('../controllers/messageController');

// Rotas protegidas
router.use(protect);

// Rotas para inquilinos
router.get('/tenant/conversations', getTenantConversations);
router.get('/tenant/messages/:chatId', getChatMessages);

// Rotas para proprietários
router.get('/landlord/conversations', getLandlordConversations);
router.get('/landlord/messages/:chatId', getChatMessages);

// Rotas comuns
router.post('/', sendMessage);
router.put('/:chatId/read', markAsRead);

module.exports = router; 
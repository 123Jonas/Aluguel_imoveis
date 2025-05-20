const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas administrativas
router.use(protect);
router.use(restrictTo('admin'));

// Rotas
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId', adminController.updateUserType);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router; 
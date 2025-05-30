const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Proteger todas as rotas administrativas
router.use(protect);
router.use(restrictTo('admin'));

// Estatísticas
router.get('/stats', adminController.getStats);
router.get('/stats/users', adminController.getUserStats);
router.get('/stats/properties', adminController.getPropertyStats);
router.get('/stats/rentals', adminController.getRentalStats);

// Gerenciamento de usuários
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Gerenciamento de propriedades
router.get('/properties', adminController.getAllProperties);
router.patch('/properties/:id', adminController.updateProperty);
router.delete('/properties/:id', adminController.deleteProperty);

// Gerenciamento de aluguéis
router.get('/rentals', adminController.getAllRentals);
router.patch('/rentals/:id', adminController.updateRental);
router.delete('/rentals/:id', adminController.deleteRental);

module.exports = router; 
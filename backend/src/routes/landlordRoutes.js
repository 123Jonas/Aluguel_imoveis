const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');
const propertyController = require('../controllers/propertyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

// Restringir acesso apenas para proprietários e admin
router.use(restrictTo('landlord', 'admin'));

// Rotas para gerenciar propriedades
router.get('/properties', landlordController.getMyProperties);
router.post('/properties', propertyController.uploadImages, landlordController.createProperty);
router.get('/properties/:id', landlordController.getProperty);
router.patch('/properties/:id', propertyController.uploadImages, landlordController.updateProperty);
router.delete('/properties/:id', landlordController.deleteProperty);

// Rotas para gerenciar aluguéis
router.get('/rentals', landlordController.getMyRentals);
router.patch('/rentals/:id/approve', landlordController.approveRental);
router.patch('/rentals/:id/reject', landlordController.rejectRental);

// Rotas para gerenciar perfil
router.get('/profile', landlordController.getProfile);
router.patch('/profile', landlordController.updateProfile);

module.exports = router; 
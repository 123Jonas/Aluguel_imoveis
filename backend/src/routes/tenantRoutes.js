const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Proteger todas as rotas
router.use(protect);
router.use(restrictTo('tenant'));

// Rotas para gerenciar aluguéis
router.get('/rentals', tenantController.getMyRentals);
router.post('/rentals', tenantController.createRental);
router.get('/rentals/:id', tenantController.getRental);
router.patch('/rentals/:id/cancel', tenantController.cancelRental);

// Rotas para gerenciar perfil
router.get('/profile', tenantController.getProfile);
router.patch('/profile', tenantController.updateProfile);

// Rotas para gerenciar favoritos
router.get('/favorites', tenantController.getFavorites);
router.post('/favorites/:propertyId', tenantController.addFavorite);
router.delete('/favorites/:propertyId', tenantController.removeFavorite);

module.exports = router; 
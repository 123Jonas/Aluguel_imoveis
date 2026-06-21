const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { protect, restrictTo } = require('../middleware/auth');

// Rotas protegidas (requerem autenticação)
router.use(protect);

// Rotas para inquilinos
router.post('/', restrictTo('tenant'), rentalController.createRental);
router.get('/my-rentals', restrictTo('tenant'), rentalController.getTenantRentals);

// Rotas para proprietários
router.get('/landlord-rentals', restrictTo('landlord'), rentalController.getLandlordRentals);
router.patch('/:id/status', restrictTo('landlord'), rentalController.updateRentalStatus);

module.exports = router; 
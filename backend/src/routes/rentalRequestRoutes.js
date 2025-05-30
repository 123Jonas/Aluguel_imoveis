const express = require('express');
const router = express.Router();
const rentalRequestController = require('../controllers/rentalRequestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Rotas protegidas - requerem autenticação
router.use(protect);

// Rotas para inquilinos
router.post('/', restrictTo('tenant'), rentalRequestController.createRentalRequest);
router.get('/my-requests', restrictTo('tenant'), rentalRequestController.getTenantRequests);

// Rotas para proprietários
router.get('/received-requests', restrictTo('landlord'), rentalRequestController.getLandlordRequests);
router.patch('/:requestId/approve', restrictTo('landlord'), rentalRequestController.approveRequest);
router.patch('/:requestId/reject', restrictTo('landlord'), rentalRequestController.rejectRequest);

module.exports = router; 
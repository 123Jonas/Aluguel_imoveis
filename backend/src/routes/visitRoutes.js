const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect, restrictTo } = require('../middleware/auth');

// Rotas protegidas (requerem autenticação)
router.use(protect);

// Rotas para inquilinos
router.post('/', restrictTo('tenant'), visitController.createVisit);
router.get('/my-visits', restrictTo('tenant'), visitController.getTenantVisits);

// Rotas para proprietários
router.get('/landlord-visits', restrictTo('landlord'), visitController.getLandlordVisits);
router.patch('/:id/status', restrictTo('landlord'), visitController.updateVisitStatus);

module.exports = router; 
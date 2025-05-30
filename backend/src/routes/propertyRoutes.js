const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

// Rotas públicas
router.get('/', propertyController.getProperties);
router.get('/available', propertyController.getAvailableProperties);
router.get('/:id', propertyController.getProperty);

// Rotas protegidas
router.use(protect);

// Rotas que requerem autenticação
router.post('/', restrictTo('landlord', 'admin'), propertyController.createProperty);
router.put('/:id', restrictTo('landlord', 'admin'), propertyController.updateProperty);
router.delete('/:id', restrictTo('landlord', 'admin'), propertyController.deleteProperty);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

// Rotas de imóveis
router
  .route('/properties')
  .get(protect, restrictTo('landlord'), propertyController.getLandlordProperties)
  .post(protect, restrictTo('landlord'), propertyController.uploadImages, propertyController.createProperty);

router
  .route('/properties/:id')
  .get(protect, propertyController.getProperty)
  .patch(protect, restrictTo('landlord'), propertyController.uploadImages, propertyController.updateProperty)
  .delete(protect, restrictTo('landlord'), propertyController.deleteProperty);

module.exports = router; 
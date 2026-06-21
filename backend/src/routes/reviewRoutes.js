const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', reviewController.getPropertyReviews);

router.use(protect);

router.post('/', restrictTo('tenant'), reviewController.createReview);
router.patch('/:id', restrictTo('tenant'), reviewController.updateReview);
router.delete('/:id', restrictTo('tenant', 'admin'), reviewController.deleteReview);

module.exports = router;

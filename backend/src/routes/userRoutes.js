const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Rotas protegidas
router.use(authMiddleware.protect);
router.patch('/profile', userController.updateProfile);
router.delete('/profile', userController.deleteProfile);

module.exports = router; 
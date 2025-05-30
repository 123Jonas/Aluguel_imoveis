const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  signup,
  login,
  logout,
  protect: protectUserController,
  restrictTo,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Rotas públicas
router.post('/register', signup);
router.post('/login', login);

// Rotas protegidas
router.get('/me', protect, getMe);
router.patch('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.patch('/updateme', protect, updateMe);
router.delete('/deleteme', protect, deleteMe);

// Rotas de administrador
router.use(protect);
router.use(restrictTo('admin'));
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router; 
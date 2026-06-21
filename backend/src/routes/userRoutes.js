const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerification
} = require('../controllers/userController');

router.post('/register', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

router.use(protect);

router.get('/me', getMe);
router.patch('/updatepassword', updatePassword);
router.patch('/updateme', updateMe);
router.delete('/deleteme', deleteMe);

router.use(restrictTo('admin'));
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

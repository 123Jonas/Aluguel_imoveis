const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Você não está logado. Faça login para ter acesso.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('O usuário deste token não existe mais.', 401));
  }

  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Senha alterada recentemente. Faça login novamente.', 401));
  }

  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
    }
    next();
  };
};

const isPropertyOwner = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new AppError('Propriedade não encontrada.', 404));
  }
  if (property.landlord.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
  }
  next();
});

const isRentalTenant = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) {
    return next(new AppError('Aluguel não encontrado.', 404));
  }
  if (rental.tenant.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
  }
  next();
});

const isRentalOwner = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id).populate('property');
  if (!rental) {
    return next(new AppError('Aluguel não encontrado.', 404));
  }
  if (rental.property.landlord.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
  }
  next();
});

const isNotificationOwner = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new AppError('Notificação não encontrada.', 404));
  }
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
  }
  next();
});

module.exports = { protect, restrictTo, isPropertyOwner, isRentalTenant, isRentalOwner, isNotificationOwner };

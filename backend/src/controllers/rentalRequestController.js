const RentalRequest = require('../models/RentalRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Criar uma nova solicitação de aluguel
exports.createRentalRequest = catchAsync(async (req, res, next) => {
  const { propertyId, startDate, endDate, message } = req.body;

  // Verificar se o imóvel existe
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new AppError('Imóvel não encontrado', 404));
  }

  // Verificar se o usuário já tem uma solicitação pendente para este imóvel
  const existingRequest = await RentalRequest.findOne({
    property: propertyId,
    tenant: req.user._id,
    status: 'pending'
  });

  if (existingRequest) {
    return next(new AppError('Você já tem uma solicitação pendente para este imóvel', 400));
  }

  // Criar a solicitação
  const rentalRequest = await RentalRequest.create({
    property: propertyId,
    tenant: req.user._id,
    landlord: property.landlord,
    startDate,
    endDate,
    message
  });

  // Popular os dados do imóvel e do inquilino
  await rentalRequest.populate([
    { path: 'property', select: 'title address price' },
    { path: 'tenant', select: 'name email phone' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      rentalRequest
    }
  });
});

// Obter todas as solicitações de um inquilino
exports.getTenantRequests = catchAsync(async (req, res, next) => {
  const requests = await RentalRequest.find({ tenant: req.user._id })
    .populate('property', 'title address price')
    .populate('landlord', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: {
      requests
    }
  });
});

// Obter todas as solicitações recebidas por um proprietário
exports.getLandlordRequests = catchAsync(async (req, res, next) => {
  const requests = await RentalRequest.find({ landlord: req.user._id })
    .populate('property', 'title address price')
    .populate('tenant', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: {
      requests
    }
  });
});

// Aprovar uma solicitação de aluguel
exports.approveRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;

  const request = await RentalRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Solicitação não encontrada', 404));
  }

  // Verificar se o usuário é o proprietário do imóvel
  if (request.landlord.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para aprovar esta solicitação', 403));
  }

  // Verificar se a solicitação está pendente
  if (request.status !== 'pending') {
    return next(new AppError('Esta solicitação já foi processada', 400));
  }

  request.status = 'approved';
  await request.save();

  res.status(200).json({
    status: 'success',
    data: {
      request
    }
  });
});

// Rejeitar uma solicitação de aluguel
exports.rejectRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { rejectionReason } = req.body;

  const request = await RentalRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Solicitação não encontrada', 404));
  }

  // Verificar se o usuário é o proprietário do imóvel
  if (request.landlord.toString() !== req.user._id.toString()) {
    return next(new AppError('Você não tem permissão para rejeitar esta solicitação', 403));
  }

  // Verificar se a solicitação está pendente
  if (request.status !== 'pending') {
    return next(new AppError('Esta solicitação já foi processada', 400));
  }

  request.status = 'rejected';
  request.rejectionReason = rejectionReason;
  await request.save();

  res.status(200).json({
    status: 'success',
    data: {
      request
    }
  });
}); 
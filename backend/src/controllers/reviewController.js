const Review = require('../models/Review');
const Property = require('../models/Property');
const Rental = require('../models/Rental');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getPropertyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ property: req.params.propertyId })
    .populate('tenant', 'name')
    .sort('-createdAt');

  res.status(200).json({ status: 'success', results: reviews.length, data: { reviews } });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return next(new AppError('Imóvel não encontrado.', 404));

  // Verificar se o tenant teve um aluguel neste imóvel
  const rental = await Rental.findOne({
    property: req.params.propertyId,
    tenant: req.user._id,
    status: { $in: ['active', 'completed'] }
  });

  if (!rental) {
    return next(new AppError('Você só pode avaliar imóveis que já alugou.', 403));
  }

  const existing = await Review.findOne({ property: req.params.propertyId, tenant: req.user._id });
  if (existing) return next(new AppError('Você já avaliou este imóvel.', 400));

  const review = await Review.create({
    property: req.params.propertyId,
    tenant: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment
  });

  await review.populate('tenant', 'name');

  res.status(201).json({ status: 'success', data: { review } });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, tenant: req.user._id },
    { rating: req.body.rating, comment: req.body.comment },
    { new: true, runValidators: true }
  );

  if (!review) return next(new AppError('Avaliação não encontrada.', 404));
  res.status(200).json({ status: 'success', data: { review } });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    tenant: req.user._id
  });

  if (!review) return next(new AppError('Avaliação não encontrada.', 404));
  res.status(204).json({ status: 'success', data: null });
});

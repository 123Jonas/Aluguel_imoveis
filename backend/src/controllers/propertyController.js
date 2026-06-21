const Property = require('../models/Property');
const { uploadFields, processPropertyImages, deleteFromCloudinary } = require('../middleware/uploadMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.uploadImages = uploadFields;
exports.processImages = processPropertyImages;

exports.createProperty = catchAsync(async (req, res, next) => {
  const { title, description, price, location, address, bedrooms, bathrooms, area, type, status, features } = req.body;

  const images = req.cloudinaryImages
    ? req.cloudinaryImages.map(img => img.url)
    : [];

  const property = await Property.create({
    title,
    description,
    price: Number(price),
    location,
    address,
    bedrooms: Number(bedrooms),
    bathrooms: Number(bathrooms),
    area: Number(area),
    type,
    status: status || 'available',
    features: typeof features === 'string' ? JSON.parse(features || '[]') : (features || []),
    images,
    landlord: req.user.id
  });

  res.status(201).json({ status: 'success', data: { property } });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError('Propriedade não encontrada.', 404));

  if (property.landlord.toString() !== req.user.id && req.user.userType !== 'admin') {
    return next(new AppError('Sem permissão para editar esta propriedade.', 403));
  }

  let images = property.images;
  if (req.body.existingImages) {
    images = typeof req.body.existingImages === 'string'
      ? JSON.parse(req.body.existingImages)
      : req.body.existingImages;
  }
  if (req.cloudinaryImages && req.cloudinaryImages.length > 0) {
    images = [...images, ...req.cloudinaryImages.map(img => img.url)];
  }

  const { title, description, price, location, address, bedrooms, bathrooms, area, type, status, features } = req.body;

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    {
      title, description, location, address, type, status,
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      features: typeof features === 'string' ? JSON.parse(features || '[]') : (features || []),
      images
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'success', data: { property: updatedProperty } });
});

exports.getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate('landlord', 'name email phone');
  if (!property) return next(new AppError('Propriedade não encontrada.', 404));
  res.status(200).json({ status: 'success', data: { property } });
});

exports.getProperties = catchAsync(async (req, res) => {
  const { type, status, minPrice, maxPrice, location, bedrooms } = req.query;
  const query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (location) query.location = new RegExp(location, 'i');
  if (bedrooms) query.bedrooms = Number(bedrooms);
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const properties = await Property.find(query)
    .populate('landlord', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});

exports.getAvailableProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({ status: 'available' })
    .populate('landlord', 'name email phone')
    .sort('-createdAt');
  res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});

exports.searchProperties = catchAsync(async (req, res) => {
  const { type, minPrice, maxPrice, location, bedrooms } = req.query;
  const query = { status: 'available' };

  if (type) query.type = type;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (location) query.location = new RegExp(location, 'i');
  if (bedrooms) query.bedrooms = Number(bedrooms);

  const properties = await Property.find(query).populate('landlord', 'name email phone');
  res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) return next(new AppError('Propriedade não encontrada.', 404));

  if (property.landlord.toString() !== req.user.id && req.user.userType !== 'admin') {
    return next(new AppError('Sem permissão para deletar esta propriedade.', 403));
  }

  // Deletar imagens do Cloudinary
  const deletePromises = property.images
    .filter(url => url.includes('cloudinary'))
    .map(url => {
      const parts = url.split('/');
      const publicIdWithExt = parts.slice(parts.indexOf('boa-estadia')).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      return deleteFromCloudinary(publicId);
    });
  await Promise.allSettled(deletePromises);

  await Property.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

exports.getLandlordProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({ landlord: req.user._id });
  res.status(200).json({ status: 'success', data: { properties } });
});

exports.updatePropertyStatus = catchAsync(async (req, res, next) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!property) return next(new AppError('Propriedade não encontrada.', 404));
  res.status(200).json({ status: 'success', data: { property } });
});

exports.getAllProperties = catchAsync(async (req, res) => {
  const properties = await Property.find().populate('landlord', 'name email phone');
  res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'A descrição é obrigatória']
  },
  price: {
    type: Number,
    required: [true, 'O preço é obrigatório'],
    min: [0, 'O preço não pode ser negativo']
  },
  location: {
    type: String,
    required: [true, 'A localização é obrigatória']
  },
  address: {
    type: String,
    required: [true, 'O endereço é obrigatório']
  },
  bedrooms: {
    type: Number,
    required: [true, 'O número de quartos é obrigatório'],
    min: [0, 'O número de quartos não pode ser negativo']
  },
  bathrooms: {
    type: Number,
    required: [true, 'O número de banheiros é obrigatório'],
    min: [0, 'O número de banheiros não pode ser negativo']
  },
  area: {
    type: Number,
    required: [true, 'A área é obrigatória'],
    min: [0, 'A área não pode ser negativa']
  },
  type: {
    type: String,
    required: [true, 'O tipo do imóvel é obrigatório'],
    enum: ['apartment', 'house', 'commercial']
  },
  status: {
    type: String,
    required: [true, 'O status é obrigatório'],
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  },
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O proprietário é obrigatório']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate para aluguéis
propertySchema.virtual('rentals', {
  ref: 'Rental',
  foreignField: 'property',
  localField: '_id'
});

// Índices
propertySchema.index({ landlord: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ price: 1 });

// Middleware para popular landlord
propertySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'landlord',
    select: 'name email phone'
  });
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 
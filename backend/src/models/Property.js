const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'A descrição é obrigatória'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'O preço é obrigatório'],
    min: [0, 'O preço não pode ser negativo']
  },
  location: {
    type: String,
    required: [true, 'A cidade é obrigatória'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'O endereço é obrigatório'],
    trim: true
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
    required: [true, 'O tipo de imóvel é obrigatório'],
    enum: {
      values: ['apartment', 'house', 'commercial'],
      message: 'Tipo de imóvel inválido'
    }
  },
  status: {
    type: String,
    required: [true, 'O status é obrigatório'],
    enum: {
      values: ['available', 'rented'],
      message: 'Status inválido'
    },
    default: 'available'
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  landlord: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'O proprietário é obrigatório']
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

// Índices para melhorar a performance das consultas
propertySchema.index({ landlord: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ location: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 
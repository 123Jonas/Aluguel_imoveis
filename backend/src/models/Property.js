const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Um título é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Uma descrição é obrigatória']
  },
  type: {
    type: String,
    required: [true, 'O tipo de imóvel é obrigatório'],
    enum: ['apartment', 'house', 'commercial', 'land']
  },
  price: {
    type: Number,
    required: [true, 'O preço é obrigatório']
  },
  address: {
    street: {
      type: String,
      required: [true, 'O endereço é obrigatório']
    },
    neighborhood: {
      type: String,
      required: [true, 'O bairro é obrigatório']
    },
    city: {
      type: String,
      required: [true, 'A cidade é obrigatória']
    },
    state: {
      type: String,
      required: [true, 'A província é obrigatória']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    parking: Number,
    furnished: Boolean
  },
  images: [{
    url: String,
    caption: String
  }],
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Um imóvel deve ter um proprietário']
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'unavailable'],
    default: 'available'
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

// Índice para busca por localização
propertySchema.index({ 'address.coordinates': '2dsphere' });
propertySchema.index({ 'address.neighborhood': 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ owner: 1 });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Um aluguel deve estar associado a um imóvel']
  },
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Um aluguel deve ter um inquilino']
  },
  landlord: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Um aluguel deve ter um proprietário']
  },
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  endDate: {
    type: Date,
    required: [true, 'Data de término é obrigatória']
  },
  price: {
    type: Number,
    required: [true, 'Valor do aluguel é obrigatório']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentDay: {
    type: Number,
    required: [true, 'Dia do pagamento é obrigatório'],
    min: 1,
    max: 31
  },
  deposit: {
    type: Number,
    required: [true, 'Valor do depósito é obrigatório']
  },
  contract: {
    signedByTenant: {
      type: Boolean,
      default: false
    },
    signedByLandlord: {
      type: Boolean,
      default: false
    },
    document: String
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

// Índices
rentalSchema.index({ property: 1, status: 1 });
rentalSchema.index({ tenant: 1, status: 1 });
rentalSchema.index({ landlord: 1, status: 1 });
rentalSchema.index({ startDate: 1 });
rentalSchema.index({ endDate: 1 });

// Middleware para popular property e users
rentalSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'property',
    select: 'title address images'
  })
  .populate({
    path: 'tenant',
    select: 'name email phone'
  })
  .populate({
    path: 'landlord',
    select: 'name email phone'
  });

  next();
});

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental; 
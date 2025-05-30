const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'O imóvel é obrigatório']
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O inquilino é obrigatório']
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O proprietário é obrigatório']
  },
  startDate: {
    type: Date,
    required: [true, 'A data de início é obrigatória']
  },
  duration: {
    type: Number,
    required: [true, 'A duração é obrigatória'],
    min: [1, 'A duração deve ser maior que 0'],
    validate: {
      validator: function(v) {
        return [12, 24, 36].includes(v);
      },
      message: 'A duração deve ser 12, 24 ou 36 meses'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'A data de término é obrigatória']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  monthlyRent: {
    type: Number,
    required: [true, 'O valor do aluguel mensal é obrigatório'],
    min: [0, 'O valor do aluguel não pode ser negativo']
  },
  securityDeposit: {
    type: Number,
    required: [true, 'O valor do depósito de segurança é obrigatório'],
    min: [0, 'O valor do depósito não pode ser negativo']
  },
  contract: {
    type: String // URL do contrato assinado
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

// Middleware para calcular a data de término
rentalSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('duration')) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + this.duration);
    this.endDate = endDate;
  }
  next();
});

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental; 
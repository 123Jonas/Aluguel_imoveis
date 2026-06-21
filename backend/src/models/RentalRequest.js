const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  documents: [{
    type: String,
    url: String,
    name: String
  }],
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
rentalRequestSchema.index({ property: 1, tenant: 1 }, { unique: true });
rentalRequestSchema.index({ landlord: 1 });
rentalRequestSchema.index({ status: 1 });

// Middleware para atualizar o updatedAt antes de salvar
rentalRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const RentalRequest = mongoose.model('RentalRequest', rentalRequestSchema);

module.exports = RentalRequest; 
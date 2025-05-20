const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Uma solicitação deve estar associada a um imóvel']
  },
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Uma solicitação deve ter um inquilino']
  },
  landlord: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Uma solicitação deve ter um proprietário']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: [true, 'A data de início é obrigatória']
  },
  endDate: {
    type: Date,
    required: [true, 'A data de término é obrigatória']
  },
  message: {
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

const RentalRequest = mongoose.model('RentalRequest', rentalRequestSchema);

module.exports = RentalRequest; 
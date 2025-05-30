const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O destinatário é obrigatório']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O remetente é obrigatório']
  },
  type: {
    type: String,
    enum: ['rental_request', 'rental_approved', 'rental_rejected', 'rental_cancelled', 'payment_due', 'payment_received', 'maintenance_request', 'maintenance_completed'],
    required: [true, 'O tipo de notificação é obrigatório']
  },
  title: {
    type: String,
    required: [true, 'O título é obrigatório'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'A mensagem é obrigatória'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityType'
  },
  relatedEntityType: {
    type: String,
    enum: ['Property', 'Rental', 'Payment', 'Maintenance']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Middleware para popular sender e relatedEntity
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sender',
    select: 'name email'
  })
  .populate({
    path: 'relatedEntity',
    select: 'title address status'
  });

  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 
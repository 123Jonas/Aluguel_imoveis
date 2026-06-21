const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'A avaliação deve ser de uma propriedade']
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A avaliação deve ter um autor']
  },
  rating: {
    type: Number,
    min: [1, 'A avaliação deve ser pelo menos 1'],
    max: [5, 'A avaliação deve ser no máximo 5'],
    required: [true, 'A avaliação é obrigatória']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'O comentário não pode ter mais de 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Um inquilino só pode avaliar um imóvel uma vez
reviewSchema.index({ property: 1, tenant: 1 }, { unique: true });

// Calcular média de avaliações da propriedade
reviewSchema.statics.calcAverageRating = async function(propertyId) {
  const stats = await this.aggregate([
    { $match: { property: propertyId } },
    { $group: { _id: '$property', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Property').findByIdAndUpdate(propertyId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await mongoose.model('Property').findByIdAndUpdate(propertyId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.property);
});

reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) doc.constructor.calcAverageRating(doc.property);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, forneça um email válido']
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória'],
    minlength: [8, 'A senha deve ter no mínimo 8 caracteres'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Por favor, confirme sua senha'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'As senhas não conferem'
    }
  },
  userType: {
    type: String,
    enum: ['admin', 'landlord', 'tenant'],
    required: [true, 'O tipo de usuário é obrigatório']
  },
  phone: {
    type: String,
    trim: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ favorites: 1 });

// Middleware para criptografar senha antes de salvar
userSchema.pre('save', async function(next) {
  // Só criptografa a senha se ela foi modificada
  if (!this.isModified('password')) return next();

  // Criptografar a senha
  this.password = await bcrypt.hash(this.password, 12);

  // Remover o campo passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Middleware para não retornar usuários inativos
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar se a senha foi alterada após a emissão do token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Método para criar token de reset de senha
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const { getPasswordResetTemplate, getEmailVerificationTemplate } = require('../utils/emailTemplates');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
});

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const signup = catchAsync(async (req, res, next) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) return next(new AppError('Este email já está cadastrado.', 400));

  // Em desenvolvimento, verificar automaticamente para não bloquear testes
  const isDev = process.env.NODE_ENV === 'development';

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    userType: req.body.userType || 'tenant',
    emailVerified: isDev ? true : false
  });

  if (isDev) {
    return res.status(201).json({
      status: 'success',
      message: 'Conta criada com sucesso! Em modo de desenvolvimento, o email foi verificado automaticamente.',
      data: { user: { name: newUser.name, email: newUser.email, userType: newUser.userType } }
    });
  }

  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Verifique o seu email - Boa Estadia',
      html: getEmailVerificationTemplate(verificationURL, newUser.name),
      text: `Acesse o link para verificar seu email: ${verificationURL}`
    });

    res.status(201).json({
      status: 'success',
      message: 'Conta criada! Verifique o seu email para activar a conta.',
      data: { user: { name: newUser.name, email: newUser.email, userType: newUser.userType } }
    });
  } catch (emailErr) {
    // Email falhou mas o token fica guardado para o utilizador usar "reenviar"
    console.error('Falha ao enviar email de verificação:', emailErr.message);
    res.status(201).json({
      status: 'success',
      message: 'Conta criada! Não foi possível enviar o email de verificação. Use a opção "Reenviar verificação" na página de login.',
      data: { user: { name: newUser.name, email: newUser.email, userType: newUser.userType } }
    });
  }
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Por favor, forneça email e senha.', 400));
  }

  const user = await User.findOne({ email }).select('+password +emailVerified');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email ou senha incorretos.', 401));
  }

  // Admins criados pelo sistema não passam por verificação de email
  if (!user.emailVerified && user.userType !== 'admin') {
    return next(new AppError('Por favor, verifique o seu email antes de fazer login. Verifique a sua caixa de entrada.', 401));
  }

  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  res.status(200).json({ status: 'success', message: 'Logout realizado com sucesso' });
};

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('Usuário não encontrado.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Sua senha atual está incorreta.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Não há usuário com este endereço de email.', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Seu token de reset de senha (válido por 10 minutos)',
      html: getPasswordResetTemplate(resetURL),
      text: `Para redefinir sua senha, acesse o link: ${resetURL}`
    });

    res.status(200).json({ status: 'success', message: 'Token enviado para o email' });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Erro ao enviar email. Tente novamente mais tarde.', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError('Token inválido ou expirado.', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  createSendToken(user, 200, res);
});

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Esta rota não é para atualização de senha. Use /updatepassword.', 400));
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'phone');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('Usuário não encontrado.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, filterObj(req.body, 'name', 'email', 'userType', 'active'), {
    new: true,
    runValidators: true
  });
  if (!user) return next(new AppError('Usuário não encontrado.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('Usuário não encontrado.', 404));
  res.status(204).json({ status: 'success', data: null });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError('Token de verificação inválido ou expirado.', 400));

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ status: 'success', message: 'Email verificado com sucesso! Já pode fazer login.' });
});

const resendVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('Não existe um utilizador com este email.', 404));
  if (user.emailVerified) return next(new AppError('Este email já está verificado.', 400));

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    email: user.email,
    subject: 'Verifique o seu email - Boa Estadia',
    html: getEmailVerificationTemplate(verificationURL, user.name),
    text: `Acesse o link para verificar seu email: ${verificationURL}`
  });

  res.status(200).json({ status: 'success', message: 'Email de verificação reenviado!' });
});

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerification
};

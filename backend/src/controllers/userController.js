const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const { getPasswordResetTemplate } = require('../utils/emailTemplates');
const bcrypt = require('bcryptjs');

// Função para gerar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Função para enviar token JWT
const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);
    
    // Remover senha do output
    user.password = undefined;

    // Adicionar informações de debug
    console.log('Token gerado:', token);
    console.log('Tipo de usuário:', user.userType);

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Erro ao gerar token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao gerar token de autenticação'
    });
  }
};

// Registrar novo usuário
const signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      userType: req.body.userType || 'tenant'
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    console.log('Tentativa de login recebida:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Verificar se email e senha existem
    if (!email || !password) {
      console.log('Email ou senha não fornecidos');
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça email e senha'
      });
    }

    // Verificar se o usuário existe e se a senha está correta
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Senha incorreta para o usuário:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = signToken(user._id);

    // Remover senha do objeto de resposta
    user.password = undefined;

    // Log para debug
    console.log('Login bem-sucedido:', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Erro detalhado no login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao fazer login. Por favor, tente novamente.'
    });
  }
};

// Logout
const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout realizado com sucesso'
  });
};

// Proteger rotas
const protect = async (req, res, next) => {
  try {
    // 1) Verificar se o token existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Você não está logado. Por favor, faça login para ter acesso'
      });
    }

    // 2) Verificar se o token é válido
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar se o usuário ainda existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário pertencente a este token não existe mais'
      });
    }

    // 4) Verificar se o usuário mudou a senha após o token ser emitido
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'O usuário mudou a senha recentemente. Por favor, faça login novamente'
      });
    }

    // Acesso concedido
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado'
    });
  }
};

// Restringir acesso a certos tipos de usuário
const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para realizar esta ação'
      });
    }
    next();
  };
};

// Obter usuário atual
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar senha
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Verificar se a senha atual está correta
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return res.status(401).json({
          status: 'error',
        message: 'Sua senha atual está incorreta'
      });
    }

    // Atualizar senha
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Logar o usuário, enviar novo token
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Esqueci minha senha
const forgotPassword = async (req, res) => {
  try {
    // 1) Obter usuário baseado no email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Não há usuário com este endereço de email'
      });
    }

    // 2) Gerar token aleatório
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Enviar email com o token
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Seu token de reset de senha (válido por 10 minutos)',
        html: getPasswordResetTemplate(resetURL),
        text: `Para redefinir sua senha, acesse o link: ${resetURL}`
      });

      res.status(200).json({
        status: 'success',
        message: 'Token enviado para o email'
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Erro ao enviar email:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erro ao enviar email. Por favor, tente novamente mais tarde.'
      });
    }
  } catch (error) {
    console.error('Erro no processo de recuperação de senha:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Resetar senha
const resetPassword = async (req, res) => {
  try {
    // 1) Obter usuário baseado no token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) Se o token não expirou e há um usuário, definir a nova senha
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
    }

    // 3) Atualizar a senha
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    // 4) Logar o usuário, enviar novo token
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar dados do usuário
const updateMe = async (req, res) => {
  try {
    // 1) Criar erro se o usuário tentar atualizar a senha
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Esta rota não é para atualização de senha. Por favor, use /updatePassword'
      });
    }

    // 2) Filtrar campos que não são permitidos serem atualizados
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone');

    // 3) Atualizar documento do usuário
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Deletar usuário atual
const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Função auxiliar para filtrar objetos
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Obter todos os usuários (apenas admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter um usuário específico (apenas admin)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

// @desc    Autenticar usuário
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter perfil', error: error.message });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
};

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter usuários', error: error.message });
  }
};

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    await user.remove();
    res.json({ message: 'Usuário removido' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
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
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  updateUser
}; 
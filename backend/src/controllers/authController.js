const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Gerar token de redefinição de senha
exports.forgotPassword = async (req, res) => {
  try {
    // 1) Obter usuário baseado no email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Não existe um usuário com este email'
      });
    }

    // 2) Gerar token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token expira em 10 minutos
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 3) Enviar email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetPassword/${resetToken}`;

    const message = `Esqueceu sua senha? Clique no link abaixo para redefinir:\n\n${resetURL}\n\nSe você não solicitou a redefinição de senha, ignore este email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Seu token de redefinição de senha (válido por 10 minutos)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token enviado para o email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'Erro ao enviar email. Tente novamente mais tarde!'
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Redefinir senha
exports.resetPassword = async (req, res) => {
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

    // 2) Se o token não expirou e existe um usuário, definir a nova senha
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Atualizar changedPasswordAt no modelo User (será feito via middleware)

    // 4) Fazer login do usuário, enviar JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
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
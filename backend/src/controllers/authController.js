const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Função para gerar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

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
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Redefinição de Senha</h2>
        <p>Olá,</p>
        <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background-color: #4CAF50; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px;
                    display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
        <p style="word-break: break-all;">${resetURL}</p>
        <p>Este link é válido por 10 minutos.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Este é um email automático, por favor não responda.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - Boa Estadia',
        message: htmlMessage,
        html: true
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

    // 3) Validar a nova senha
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // 4) Atualizar a senha
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 5) Gerar novo token JWT
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Senha redefinida com sucesso!',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 
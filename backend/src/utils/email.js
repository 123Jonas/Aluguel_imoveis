const nodemailer = require('nodemailer');

// Debug das variáveis de ambiente
console.log('Email Config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  username: process.env.EMAIL_USERNAME,
  from: process.env.EMAIL_FROM
});

// Criar um transporter reutilizável usando SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Função para enviar email
const sendEmail = async (options) => {
  try {
    // Verificar se as credenciais de email estão configuradas
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.error('Variáveis de ambiente não encontradas:', {
        EMAIL_USERNAME: process.env.EMAIL_USERNAME,
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Definida' : 'Não definida'
      });
      throw new Error('Credenciais de email não configuradas. Configure as variáveis de ambiente EMAIL_USERNAME e EMAIL_PASSWORD.');
    }

    // Configurar as opções do email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Boa Estadia <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.text || options.message,
      html: options.html
    };

    // Enviar o email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email. Por favor, tente novamente mais tarde.');
  }
};

module.exports = sendEmail; 
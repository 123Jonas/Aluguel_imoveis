const nodemailer = require('nodemailer');

// Criar um transporter reutilizável usando SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Você pode mudar para outro serviço de email
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USERNAME || 'seu-email@gmail.com', // email que enviará as mensagens
    pass: process.env.EMAIL_PASSWORD || 'sua-senha-de-app' // senha do email ou senha de app
  }
});

// Função para enviar email
const sendEmail = async (options) => {
  try {
    // Configurar as opções do email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Boa Estadia <seu-email@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    // Enviar o email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email. Por favor, tente novamente mais tarde.');
  }
};

module.exports = sendEmail; 
const getPasswordResetTemplate = (resetURL) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 5px;
          padding: 20px;
          margin: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperação de Senha</h1>
        </div>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Se você não fez esta solicitação, por favor ignore este email.</p>
        <p>Para redefinir sua senha, clique no botão abaixo:</p>
        <div style="text-align: center;">
          <a href="${resetURL}" class="button">Redefinir Senha</a>
        </div>
        <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
        <p>${resetURL}</p>
        <p>Este link é válido por 10 minutos.</p>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
          <p>&copy; 2024 Boa Estadia. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getPasswordResetTemplate
}; 
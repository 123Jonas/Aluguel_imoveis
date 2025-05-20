const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const initDB = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Verificar se já existe um admin
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (!adminExists) {
      // Criar usuário admin
      await User.create({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: 'admin123',
        phone: '+244123456789',
        userType: 'admin',
        isAdmin: true
      });
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe.');
    }

    // Desconectar do MongoDB
    await mongoose.disconnect();
    console.log('Inicialização do banco de dados concluída.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
};

initDB(); 
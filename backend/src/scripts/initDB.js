const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const initDB = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: 'Administrador',
        email: adminEmail,
        password: 'admin123',
        passwordConfirm: 'admin123',
        phone: '+244923000000',
        userType: 'admin',
        emailVerified: true
      });
      console.log('Utilizador admin criado com sucesso!');
    } else {
      // Garantir que o admin existente tem emailVerified = true
      if (!existingAdmin.emailVerified) {
        await User.findByIdAndUpdate(existingAdmin._id, { emailVerified: true });
        console.log('Admin existente actualizado: emailVerified = true');
      } else {
        console.log('Utilizador admin já existe e está verificado.');
      }
    }

    await mongoose.disconnect();
    console.log('Inicialização da base de dados concluída.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar a base de dados:', error.message);
    process.exit(1);
  }
};

initDB();

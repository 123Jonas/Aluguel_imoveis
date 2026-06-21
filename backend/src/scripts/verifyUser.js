/**
 * Verificar manualmente um utilizador por email.
 * Uso: node src/scripts/verifyUser.js <email>
 * Exemplo: node src/scripts/verifyUser.js joao@exemplo.com
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const run = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('Uso: node src/scripts/verifyUser.js <email>');
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        emailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      },
      { new: true }
    );

    if (!user) {
      console.error(`Utilizador com email "${email}" nao encontrado.`);
      process.exit(1);
    }

    console.log(`Utilizador "${user.name}" (${user.email}) verificado com sucesso!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
};

run();

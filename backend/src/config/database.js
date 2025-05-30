const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aluguel_imoveis';
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoURI, options);

    mongoose.connection.on('error', (err) => {
      console.error('Erro na conexão com MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado. Tentando reconectar...');
      setTimeout(connectDB, 5000);
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 
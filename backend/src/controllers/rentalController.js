const Rental = require('../models/Rental');
const Property = require('../models/Property');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

// Criar um novo aluguel
const createRental = async (req, res) => {
  try {
    const { property, startDate, duration } = req.body;
    const tenant = req.user._id;

    // Validar campos obrigatórios
    if (!property || !startDate || !duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor, forneça todos os campos obrigatórios'
      });
    }

    // Validar data de início
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        status: 'error',
        message: 'A data de início deve ser futura'
      });
    }

    // Validar duração
    const allowedDurations = [12, 24, 36];
    if (!allowedDurations.includes(Number(duration))) {
      return res.status(400).json({
        status: 'error',
        message: 'Duração inválida. Use 12, 24 ou 36 meses'
      });
    }

    // Verificar se a propriedade existe e está disponível
    const propertyExists = await Property.findOne({
      _id: property,
      status: 'available'
    });

    if (!propertyExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Propriedade não encontrada ou não está disponível'
      });
    }

    // Verificar se já existe um aluguel pendente para esta propriedade e inquilino
    const existingRental = await Rental.findOne({
      property,
      tenant,
      status: 'pending'
    });

    if (existingRental) {
      return res.status(400).json({
        status: 'error',
        message: 'Você já tem uma solicitação pendente para esta propriedade'
      });
    }

    // Calcular a data de término
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);

    // Criar o aluguel com todos os campos necessários
    const rental = await Rental.create({
      property,
      tenant,
      landlord: propertyExists.landlord,
      startDate: start,
      endDate: end,
      duration,
      monthlyRent: propertyExists.price,
      securityDeposit: propertyExists.price * 2, // 2 meses de depósito
      status: 'pending'
    });

    // Enviar notificação para o proprietário
    const landlord = await User.findById(propertyExists.landlord);
    if (landlord) {
      await notificationService.createNotification({
        user: landlord._id,
        type: 'rental_request',
        title: 'Nova solicitação de aluguel',
        message: `Você recebeu uma nova solicitação de aluguel para a propriedade ${propertyExists.title}`,
        rental: rental._id
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    console.error('Erro ao criar aluguel:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter aluguéis do inquilino
const getTenantRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ tenant: req.user._id })
      .populate('property')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter aluguéis do proprietário
const getLandlordRentals = async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const rentals = await Rental.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('tenant', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar status do aluguel
const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        status: 'error',
        message: 'Aluguel não encontrado'
      });
    }

    // Verificar se o usuário tem permissão
    const property = await Property.findById(rental.property);
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para atualizar este aluguel'
      });
    }

    // Atualizar status
    rental.status = status;
    if (status === 'approved') {
      rental.approvedAt = new Date();
    }
    await rental.save();

    // Atualizar status da propriedade
    if (status === 'approved') {
      await Property.findByIdAndUpdate(rental.property, { status: 'rented' });
    }

    // Enviar notificação para o inquilino
    await notificationService.createNotification({
      user: rental.tenant,
      type: 'rental_status',
      title: 'Status do aluguel atualizado',
      message: `Seu pedido de aluguel foi ${status === 'approved' ? 'aprovado' : 'rejeitado'}`,
      rental: rental._id
    });

    res.status(200).json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter todos os aluguéis (apenas admin)
const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('property')
      .populate('tenant', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: rentals.length,
      data: {
        rentals
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createRental,
  getTenantRentals,
  getLandlordRentals,
  updateRentalStatus,
  getAllRentals
}; 
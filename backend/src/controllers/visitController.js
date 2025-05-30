const Visit = require('../models/Visit');
const Property = require('../models/Property');

// Criar uma nova visita
exports.createVisit = async (req, res) => {
  try {
    const { property, date, time, notes } = req.body;
    const tenant = req.user._id;

    // Verificar se o imóvel existe
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Imóvel não encontrado'
      });
    }

    // Criar a visita
    const visit = await Visit.create({
      property,
      tenant,
      date,
      time,
      notes
    });

    res.status(201).json({
      status: 'success',
      data: {
        visit
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter visitas do inquilino
exports.getTenantVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ tenant: req.user._id })
      .populate('property', 'title location images')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        visits
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obter visitas do proprietário
exports.getLandlordVisits = async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate({
        path: 'property',
        match: { landlord: req.user._id },
        select: 'title location images'
      })
      .populate('tenant', 'name email phone')
      .sort('-createdAt');

    // Filtrar visitas onde o imóvel pertence ao proprietário
    const filteredVisits = visits.filter(visit => visit.property !== null);

    res.status(200).json({
      status: 'success',
      data: {
        visits: filteredVisits
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Atualizar status da visita
exports.updateVisitStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        status: 'error',
        message: 'Visita não encontrada'
      });
    }

    // Verificar se o usuário é o proprietário do imóvel
    const property = await Property.findById(visit.property);
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para atualizar esta visita'
      });
    }

    visit.status = status;
    await visit.save();

    res.status(200).json({
      status: 'success',
      data: {
        visit
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 
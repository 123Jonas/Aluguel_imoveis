const { validationResult } = require('express-validator');

// Middleware para validar os resultados da validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }
  next();
};

// Validações para usuários
const userValidations = {
  register: [
    // Nome
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Nome é obrigatório')
      .isLength({ min: 3 })
      .withMessage('Nome deve ter no mínimo 3 caracteres'),
    
    // Email
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    // Senha
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Senha é obrigatória')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    
    // Confirmação de senha
    body('passwordConfirm')
      .trim()
      .notEmpty()
      .withMessage('Confirmação de senha é obrigatória')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('As senhas não conferem');
        }
        return true;
      }),
    
    // Tipo de usuário
    body('userType')
      .trim()
      .notEmpty()
      .withMessage('Tipo de usuário é obrigatório')
      .isIn(['admin', 'landlord', 'tenant'])
      .withMessage('Tipo de usuário inválido'),
    
    // Telefone
    body('phone')
      .optional()
      .trim()
      .isMobilePhone('pt-BR')
      .withMessage('Telefone inválido')
  ],

  login: [
    // Email
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email é obrigatório')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    // Senha
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Senha é obrigatória')
  ],

  updateProfile: [
    // Nome
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Nome deve ter no mínimo 3 caracteres'),
    
    // Email
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    
    // Telefone
    body('phone')
      .optional()
      .trim()
      .isMobilePhone('pt-BR')
      .withMessage('Telefone inválido')
  ],

  updatePassword: [
    // Senha atual
    body('currentPassword')
      .trim()
      .notEmpty()
      .withMessage('Senha atual é obrigatória'),
    
    // Nova senha
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Nova senha é obrigatória')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter no mínimo 6 caracteres'),
    
    // Confirmação de nova senha
    body('newPasswordConfirm')
      .trim()
      .notEmpty()
      .withMessage('Confirmação de nova senha é obrigatória')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('As senhas não conferem');
        }
        return true;
      })
  ]
};

// Validações para propriedades
const propertyValidations = {
  create: [
    // Título
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Título é obrigatório')
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    
    // Descrição
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Descrição é obrigatória')
      .isLength({ min: 10 })
      .withMessage('Descrição deve ter no mínimo 10 caracteres'),
    
    // Tipo
    body('type')
      .trim()
      .notEmpty()
      .withMessage('Tipo é obrigatório')
      .isIn(['house', 'apartment', 'commercial'])
      .withMessage('Tipo inválido'),
    
    // Preço
    body('price')
      .notEmpty()
      .withMessage('Preço é obrigatório')
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    
    // Endereço
    body('address')
      .trim()
      .notEmpty()
      .withMessage('Endereço é obrigatório'),
    
    // Cidade
    body('city')
      .trim()
      .notEmpty()
      .withMessage('Cidade é obrigatória'),
    
    // Estado
    body('state')
      .trim()
      .notEmpty()
      .withMessage('Estado é obrigatório')
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres'),
    
    // CEP
    body('zipCode')
      .trim()
      .notEmpty()
      .withMessage('CEP é obrigatório')
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
    
    // Área
    body('area')
      .notEmpty()
      .withMessage('Área é obrigatória')
      .isFloat({ min: 0 })
      .withMessage('Área deve ser um número positivo'),
    
    // Quartos
    body('bedrooms')
      .notEmpty()
      .withMessage('Número de quartos é obrigatório')
      .isInt({ min: 0 })
      .withMessage('Número de quartos deve ser um número inteiro positivo'),
    
    // Banheiros
    body('bathrooms')
      .notEmpty()
      .withMessage('Número de banheiros é obrigatório')
      .isInt({ min: 0 })
      .withMessage('Número de banheiros deve ser um número inteiro positivo'),
    
    // Vagas de garagem
    body('parkingSpaces')
      .notEmpty()
      .withMessage('Número de vagas de garagem é obrigatório')
      .isInt({ min: 0 })
      .withMessage('Número de vagas de garagem deve ser um número inteiro positivo'),
    
    // Imagens
    body('images')
      .isArray()
      .withMessage('Imagens deve ser um array')
      .notEmpty()
      .withMessage('Pelo menos uma imagem é obrigatória')
  ],

  update: [
    // Título
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Título deve ter entre 3 e 100 caracteres'),
    
    // Descrição
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Descrição deve ter no mínimo 10 caracteres'),
    
    // Tipo
    body('type')
      .optional()
      .trim()
      .isIn(['house', 'apartment', 'commercial'])
      .withMessage('Tipo inválido'),
    
    // Preço
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    
    // Endereço
    body('address')
      .optional()
      .trim(),
    
    // Cidade
    body('city')
      .optional()
      .trim(),
    
    // Estado
    body('state')
      .optional()
      .trim()
      .isLength({ min: 2, max: 2 })
      .withMessage('Estado deve ter 2 caracteres'),
    
    // CEP
    body('zipCode')
      .optional()
      .trim()
      .matches(/^\d{5}-?\d{3}$/)
      .withMessage('CEP inválido'),
    
    // Área
    body('area')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Área deve ser um número positivo'),
    
    // Quartos
    body('bedrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Número de quartos deve ser um número inteiro positivo'),
    
    // Banheiros
    body('bathrooms')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Número de banheiros deve ser um número inteiro positivo'),
    
    // Vagas de garagem
    body('parkingSpaces')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Número de vagas de garagem deve ser um número inteiro positivo'),
    
    // Imagens
    body('images')
      .optional()
      .isArray()
      .withMessage('Imagens deve ser um array')
  ]
};

// Validações para aluguéis
const rentalValidations = {
  create: [
    // Propriedade
    body('property')
      .notEmpty()
      .withMessage('Propriedade é obrigatória')
      .isMongoId()
      .withMessage('ID de propriedade inválido'),
    
    // Data de início
    body('startDate')
      .notEmpty()
      .withMessage('Data de início é obrigatória')
      .isISO8601()
      .withMessage('Data de início inválida')
      .custom((value) => {
        const startDate = new Date(value);
        const today = new Date();
        if (startDate < today) {
          throw new Error('Data de início deve ser futura');
        }
        return true;
      }),
    
    // Duração
    body('duration')
      .notEmpty()
      .withMessage('Duração é obrigatória')
      .isInt({ min: 12, max: 36 })
      .withMessage('Duração deve ser entre 12 e 36 meses')
  ],

  update: [
    // Status
    body('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'cancelled', 'completed'])
      .withMessage('Status inválido'),
    
    // Data de início
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data de início inválida')
      .custom((value) => {
        const startDate = new Date(value);
        const today = new Date();
        if (startDate < today) {
          throw new Error('Data de início deve ser futura');
        }
        return true;
      }),
    
    // Duração
    body('duration')
      .optional()
      .isInt({ min: 12, max: 36 })
      .withMessage('Duração deve ser entre 12 e 36 meses')
  ]
};

module.exports = {
  validate,
  userValidations,
  propertyValidations,
  rentalValidations
}; 
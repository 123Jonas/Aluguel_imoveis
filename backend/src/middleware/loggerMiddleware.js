const winston = require('winston');
const morgan = require('morgan');
const path = require('path');

// Configuração do Winston
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'aluguel-imoveis-api' },
  transports: [
    // Escreve todos os logs com nível 'error' e abaixo para 'error.log'
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    // Escreve todos os logs com nível 'info' e abaixo para 'combined.log'
    new winston.transports.File({
      filename: path.join('logs', 'combined.log')
    })
  ]
});

// Se não estiver em produção, também loga para o console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Configuração do Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
const morganOptions = {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
};

// Middleware de logging
const loggerMiddleware = morgan(morganFormat, morganOptions);

// Middleware para log de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};

// Middleware para log de erros
const errorLogger = (err, req, res, next) => {
  logger.error({
    error: {
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers
    }
  });
  
  next(err);
};

// Função para log de eventos do sistema
const logSystemEvent = (event, data) => {
  logger.info({
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Função para log de erros do sistema
const logSystemError = (error, context) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack
    },
    context,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  loggerMiddleware,
  requestLogger,
  errorLogger,
  logSystemEvent,
  logSystemError
}; 
const compression = require('compression');

// Configuração do middleware de compressão
const compressionOptions = {
  // Nível de compressão (1-9, onde 9 é o máximo)
  level: 6,
  
  // Tamanho mínimo para compressão (em bytes)
  threshold: 1024,
  
  // Tipos de conteúdo que serão comprimidos
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Usa a compressão padrão do compression
    return compression.filter(req, res);
  },
  
  // Configuração específica para diferentes tipos de conteúdo
  contentType: [
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'application/x-www-form-urlencoded'
  ]
};

// Middleware de compressão
const compressionMiddleware = compression(compressionOptions);

// Middleware para verificar se a compressão é suportada
const checkCompressionSupport = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'];
  
  if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
    res.set('X-Compression-Supported', 'false');
  } else {
    res.set('X-Compression-Supported', 'true');
  }
  
  next();
};

// Middleware para configurar headers de cache
const setCompressionHeaders = (req, res, next) => {
  // Adiciona headers para melhorar o cache
  res.set('Vary', 'Accept-Encoding');
  
  // Adiciona header para indicar que o conteúdo está comprimido
  if (res.getHeader('Content-Encoding')) {
    res.set('X-Content-Compressed', 'true');
  }
  
  next();
};

module.exports = {
  compressionMiddleware,
  checkCompressionSupport,
  setCompressionHeaders
}; 
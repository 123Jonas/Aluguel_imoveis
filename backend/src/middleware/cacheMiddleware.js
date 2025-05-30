const redis = require('redis');
const { promisify } = require('util');

// Configuração do cliente Redis
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('O servidor Redis recusou a conexão');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Tempo limite de retry excedido');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Promisify dos métodos do Redis
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const keysAsync = promisify(client.keys).bind(client);

// Middleware de cache
const cache = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await getAsync(key);

      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // Sobrescreve o método json para interceptar a resposta
      const originalJson = res.json;
      res.json = function(body) {
        setAsync(key, JSON.stringify(body), 'EX', duration)
          .catch(err => console.error('Erro ao salvar no cache:', err));
        
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      console.error('Erro no middleware de cache:', err);
      next();
    }
  };
};

// Função para limpar cache por padrão
const clearCacheByPattern = async (pattern) => {
  try {
    const keys = await keysAsync(`cache:${pattern}`);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => delAsync(key)));
    }
  } catch (err) {
    console.error('Erro ao limpar cache:', err);
  }
};

// Função para limpar cache específico
const clearCache = async (key) => {
  try {
    await delAsync(`cache:${key}`);
  } catch (err) {
    console.error('Erro ao limpar cache:', err);
  }
};

// Middleware para limpar cache após operações de escrita
const clearCacheAfterWrite = (pattern) => {
  return async (req, res, next) => {
    // Sobrescreve o método json para interceptar a resposta
    const originalJson = res.json;
    res.json = function(body) {
      clearCacheByPattern(pattern)
        .catch(err => console.error('Erro ao limpar cache:', err));
      
      return originalJson.call(this, body);
    };

    next();
  };
};

// Eventos do Redis
client.on('connect', () => {
  console.log('Conectado ao Redis');
});

client.on('error', (err) => {
  console.error('Erro no Redis:', err);
});

module.exports = {
  cache,
  clearCache,
  clearCacheByPattern,
  clearCacheAfterWrite
}; 
const fs = require('fs');
const path = require('path');

// Arquivo de configuração de manutenção
const maintenanceConfigPath = path.join(__dirname, '..', 'config', 'maintenance.json');

// Função para ler a configuração de manutenção
const readMaintenanceConfig = () => {
  try {
    if (fs.existsSync(maintenanceConfigPath)) {
      const config = JSON.parse(fs.readFileSync(maintenanceConfigPath, 'utf8'));
      return config;
    }
    return { enabled: false, message: 'Sistema em manutenção' };
  } catch (err) {
    console.error('Erro ao ler configuração de manutenção:', err);
    return { enabled: false, message: 'Sistema em manutenção' };
  }
};

// Função para atualizar a configuração de manutenção
const updateMaintenanceConfig = (config) => {
  try {
    fs.writeFileSync(maintenanceConfigPath, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error('Erro ao atualizar configuração de manutenção:', err);
    return false;
  }
};

// Middleware de manutenção
const maintenanceMiddleware = (req, res, next) => {
  const config = readMaintenanceConfig();
  
  if (config.enabled) {
    // Lista de IPs permitidos durante a manutenção
    const allowedIPs = config.allowedIPs || [];
    
    // Verifica se o IP do cliente está na lista de permitidos
    const clientIP = req.ip;
    if (allowedIPs.includes(clientIP)) {
      return next();
    }
    
    // Retorna resposta de manutenção
    return res.status(503).json({
      status: 'error',
      message: config.message || 'Sistema em manutenção',
      estimatedTime: config.estimatedTime || 'Indeterminado'
    });
  }
  
  next();
};

// Middleware para verificar status de manutenção
const checkMaintenanceStatus = (req, res, next) => {
  const config = readMaintenanceConfig();
  
  res.set('X-Maintenance-Mode', config.enabled ? 'true' : 'false');
  
  if (config.enabled) {
    res.set('X-Maintenance-Message', config.message);
    if (config.estimatedTime) {
      res.set('X-Maintenance-Estimated-Time', config.estimatedTime);
    }
  }
  
  next();
};

// Função para ativar modo de manutenção
const enableMaintenance = (message, estimatedTime, allowedIPs = []) => {
  const config = {
    enabled: true,
    message: message || 'Sistema em manutenção',
    estimatedTime: estimatedTime || 'Indeterminado',
    allowedIPs: allowedIPs,
    enabledAt: new Date().toISOString()
  };
  
  return updateMaintenanceConfig(config);
};

// Função para desativar modo de manutenção
const disableMaintenance = () => {
  const config = {
    enabled: false,
    message: 'Sistema em manutenção',
    disabledAt: new Date().toISOString()
  };
  
  return updateMaintenanceConfig(config);
};

// Função para verificar se o sistema está em manutenção
const isInMaintenance = () => {
  const config = readMaintenanceConfig();
  return config.enabled;
};

module.exports = {
  maintenanceMiddleware,
  checkMaintenanceStatus,
  enableMaintenance,
  disableMaintenance,
  isInMaintenance
}; 
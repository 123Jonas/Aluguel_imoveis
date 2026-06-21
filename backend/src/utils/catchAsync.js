// Função para envolver funções assíncronas e capturar erros
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 
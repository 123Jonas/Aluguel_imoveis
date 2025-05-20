const express = require('express');
const router = express.Router();

// Rota para obter aluguéis do inquilino
router.get('/rentals', (req, res) => {
  res.json({ message: 'Lista de aluguéis do inquilino' });
});

// Rota para solicitar um novo aluguel
router.post('/rentals', (req, res) => {
  res.json({ message: 'Solicitação de aluguel enviada' });
});

module.exports = router; 
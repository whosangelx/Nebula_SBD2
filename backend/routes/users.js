const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Rota de REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Verifica se o EMAIL já existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Este email já está sendo usado.' });
    }

    // 2. Verifica se o USUÁRIO já existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Este nome de usuário já existe. Escolha outro.' });
    }

    // 3. Cria o usuário
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json(newUser);

  } catch (err) {
    // Tratamento extra caso o banco retorne erro de duplicidade
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Usuário ou Email já cadastrado no sistema.' });
    }
    res.status(500).json({ message: 'Erro no servidor: ' + err.message });
  }
});

// Rota de LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Email ou senha incorretos.' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importação das rotas
const songsRoutes = require('./routes/songs');
const playlistsRoutes = require('./routes/playlists');
const usersRoutes = require('./routes/users');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Aceitar JSON no body das requisições

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas API
app.use('/api/songs', songsRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/users', usersRoutes);

// Servir frontend estático
// Ajustamos para apontar para a pasta frontend corretamente
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota "Coringa" para o Frontend (SPA)
// Qualquer rota que não seja API será enviada para o React/HTML
// CORREÇÃO: Usamos /.*/ em vez de '*' para evitar erro na nova versão do Express
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
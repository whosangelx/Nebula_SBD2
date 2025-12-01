const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// GET - Listar playlists (Filtrando por Usuário)
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  try {
    // Se não tiver ID do usuário, retorna vazio por segurança
    if (!userId) return res.json([]);
    
    // Busca playlists e popula os dados das músicas (título, capa, url)
    const playlists = await Playlist.find({ user: userId }).populate('songs'); 
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Pegar UMA playlist detalhada pelo ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist não encontrada' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Criar nova playlist
router.post('/', async (req, res) => {
  try {
    // O frontend envia { name: "Nome", user: "ID_DO_USUARIO" }
    const newPlaylist = new Playlist(req.body);
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Atualizar Nome da Playlist
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        req.params.id, 
        { name }, 
        { new: true } // Retorna o objeto já atualizado
    );
    res.json(updatedPlaylist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Adicionar Música na Playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    
    // Verifica se a música já existe na playlist para evitar duplicatas
    if (!playlist.songs.includes(songId)) {
        playlist.songs.push(songId);
        await playlist.save();
    }
    
    // Retorna a playlist atualizada com os dados populados
    const populated = await playlist.populate('songs');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Remover Música específica da Playlist
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    // Filtra o array de músicas removendo o ID especificado
    playlist.songs = playlist.songs.filter(id => id.toString() !== req.params.songId);
    await playlist.save();
    
    const populated = await playlist.populate('songs');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Excluir playlist inteira
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
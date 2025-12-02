const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Song = require('../models/Song');

// --- CONFIGURAÇÃO DO UPLOAD (MULTER) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Salva na pasta 'uploads' na raiz do backend
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Gera nome único: Timestamp + Nome original limpo de espaços
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// GET - Listar músicas (Mais recentes primeiro)
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Upload de Nova Música
// Aceita 2 arquivos: 'audioFile' (mp3) e 'coverFile' (imagem)
router.post('/', upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'coverFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album, genre } = req.body;

    // Validação: Áudio é obrigatório
    if (!req.files || !req.files.audioFile) {
        return res.status(400).json({ message: 'Arquivo de áudio é obrigatório.' });
    }

    // Pega o nome do arquivo salvo
    const audioFilename = req.files.audioFile[0].filename;
    // Cria o link relativo (ex: /uploads/12345-musica.mp3)
    const audioUrl = `/uploads/${audioFilename}`;

    // Capa (se não tiver, usa placeholder)
    let coverImageUrl = 'https://via.placeholder.com/150'; 
    if (req.files.coverFile) {
        const coverFilename = req.files.coverFile[0].filename;
        coverImageUrl = `/uploads/${coverFilename}`;
    }

    const newSong = new Song({
      title,
      artist,
      album,
      genre,
      audioUrl,
      coverImageUrl
    });

    await newSong.save();
    res.status(201).json(newSong);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao processar upload.' });
  }
});

module.exports = router;
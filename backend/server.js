require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Necessário para apagar arquivos
const multer = require('multer');

// Modelos e Rotas
const Song = require('./models/Song'); 
const usersRoutes = require('./routes/users');
const playlistsRoutes = require('./routes/playlists');

const app = express();

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nome único: Timestamp + nome limpo
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json()); // Permite ler JSON no body

// Pasta Pública de Uploads (Para o frontend acessar as imagens/músicas)
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, '../frontend')));

// --- MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('❌ Erro Mongo:', err));

// --- ROTAS DA API ---

// 1. UPLOAD DE MÚSICA (Salva quem enviou)
app.post('/api/songs', upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'coverFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album, genre, userId } = req.body;
    
    // Validações
    if (!req.files || !req.files.audioFile) {
        return res.status(400).json({ message: 'O arquivo de áudio (MP3) é obrigatório.' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Usuário não identificado. Faça login.' });
    }

    const audioUrl = `/uploads/${req.files.audioFile[0].filename}`;
    
    let coverImageUrl = 'https://via.placeholder.com/150';
    if (req.files.coverFile) {
        coverImageUrl = `/uploads/${req.files.coverFile[0].filename}`;
    }

    const newSong = new Song({
      title, artist, album, genre, audioUrl, coverImageUrl,
      uploadedBy: userId // IMPORTANTE: Salva o ID do dono
    });

    await newSong.save();
    res.status(201).json(newSong);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao fazer upload.' });
  }
});

// 2. LISTAR MÚSICAS
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find().sort({ createdAt: -1 });
        res.json(songs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. DELETAR MÚSICA (Exclusivo do Dono)
app.delete('/api/songs/:id', async (req, res) => {
    try {
        const songId = req.params.id;
        const { userId } = req.body; // Quem está tentando apagar?

        const song = await Song.findById(songId);
        if (!song) return res.status(404).json({ message: 'Música não encontrada.' });

        // VERIFICAÇÃO DE SEGURANÇA
        if (song.uploadedBy.toString() !== userId) {
            return res.status(403).json({ message: 'Permissão negada. Você não é o dono desta música.' });
        }

        // 1. Apagar arquivo de áudio físico
        const audioPath = path.join(__dirname, 'uploads', path.basename(song.audioUrl));
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        // 2. Apagar capa física (se não for placeholder)
        if (song.coverImageUrl && !song.coverImageUrl.includes('placeholder')) {
            const coverPath = path.join(__dirname, 'uploads', path.basename(song.coverImageUrl));
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }

        // 3. Apagar registro do Banco
        await Song.findByIdAndDelete(songId);

        res.json({ message: 'Música deletada com sucesso.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao deletar música.' });
    }
});

// Outras rotas importadas
app.use('/api/users', usersRoutes);
app.use('/api/playlists', playlistsRoutes);

// Rota Fallback para o Frontend (SPA)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nebula rodando na porta ${PORT}`);
});
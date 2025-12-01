const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');
const Playlist = require('./models/Playlist');

// Carregar variáveis de ambiente
dotenv.config();

// URL BASE do Áudio (Local)
// Certifique-se de que os arquivos .mp3 estão na pasta 'frontend/musicas'
const BASE_URL = "http://localhost:4000/musicas";

const songsData = [
  {
    title: "Anos Luz",
    artist: "Matuê",
    album: "Single",
    audioUrl: `${BASE_URL}/anos-luz.mp3`,
    // Capa Personalizada (Pinterest)
    coverImageUrl: "https://i.pinimg.com/736x/3c/9e/4b/3c9e4bf30bd854a8dc9a1b97a2c1935b.jpg",
    genre: "Trap",
    duration: 215
  },
  {
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    audioUrl: `${BASE_URL}/midnight-city.mp3`,
    // Capa Personalizada (Pinterest)
    coverImageUrl: "https://i.pinimg.com/736x/ee/27/6d/ee276db970238ce9866a51e1498f45c0.jpg",
    genre: "Synthpop",
    duration: 243
  },
  {
    title: "Ocean Eyes",
    artist: "Billie Eilish",
    album: "Don't Smile at Me",
    audioUrl: `${BASE_URL}/ocean-eyes.mp3`,
    // Capa Personalizada (SoundCloud)
    coverImageUrl: "https://i1.sndcdn.com/artworks-000194211850-6zfpyg-t1080x1080.jpg",
    genre: "Pop",
    duration: 200
  },
  {
    title: "Black Swan",
    artist: "BTS",
    album: "Map of the Soul: 7",
    audioUrl: `${BASE_URL}/black-swan.mp3`,
    // Capa Personalizada (Bing)
    coverImageUrl: "https://th.bing.com/th/id/R.c0193c1428c483115811b17d430ef3a1?rik=y2oFCvrVA8ekhQ&pid=ImgRaw&r=0",
    genre: "K-Pop",
    duration: 198
  },
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    audioUrl: `${BASE_URL}/blinding-lights.mp3`,
    // Capa Spotify (Estável)
    coverImageUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    genre: "Synthwave",
    duration: 200
  },
  {
    title: "Do I Wanna Know?",
    artist: "Arctic Monkeys",
    album: "AM",
    audioUrl: `${BASE_URL}/do-i-wanna-know.mp3`,
    // Capa Spotify (Estável)
    coverImageUrl: "https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163",
    genre: "Indie Rock",
    duration: 272
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Conectado ao MongoDB...");

    // Limpa músicas antigas e insere as novas
    await Song.deleteMany({});
    await Song.insertMany(songsData);
    
    console.log(`🚀 Banco atualizado com sucesso!`);
    console.log(`🖼️ Capas personalizadas inseridas.`);
    console.log(`🎵 Áudios apontando para pasta local (frontend/musicas).`);
    
    process.exit();
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
};

seedDB();
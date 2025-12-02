const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    genre: { type: String },
    audioUrl: { type: String, required: true }, // Caminho do arquivo
    coverImageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    
    // NOVO CAMPO: ID do usuário que fez o upload
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
});

module.exports = mongoose.model('Song', SongSchema);
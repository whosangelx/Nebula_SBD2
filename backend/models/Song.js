const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  audioUrl: { type: String, required: true }, // Link do Firebase/S3
  coverImageUrl: { type: String },
  duration: { type: Number },
  genre: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);
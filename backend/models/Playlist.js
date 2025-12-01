const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);
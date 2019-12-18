const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  resolveTime: Number,
  winner: Number,
  players: [Number],
});

module.exports = mongoose.model('Match', matchSchema);

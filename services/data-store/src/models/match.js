const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  players: [Number],
  winner: Number,
  resolveTime: Number,
});

module.exports = mongoose.model('Match', matchSchema);

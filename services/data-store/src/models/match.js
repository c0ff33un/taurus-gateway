const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  winner: String,
  players: [String],
  resolveTime: Number
});

module.exports = mongoose.model('Match', matchSchema);

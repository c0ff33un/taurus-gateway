const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  winner: String,
  players: [String]
});

module.exports = mongoose.model('Match', matchSchema);

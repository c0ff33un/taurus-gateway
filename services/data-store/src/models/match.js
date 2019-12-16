const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
  winner: Number,
  players: [Number]
});

module.exports = mongoose.model('Match', matchSchema);

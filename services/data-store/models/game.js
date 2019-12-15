const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  seed: String,
});

module.exports = mongoose.model('Game', gameSchema);
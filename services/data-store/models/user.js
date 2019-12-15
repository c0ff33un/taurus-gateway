const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  authId: Number,
  handle: String,
  email: String,
});

module.exports = mongoose.model('User', userSchema);
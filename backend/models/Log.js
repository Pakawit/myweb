const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true }, 
  user: { type: String, required: true }, 
  details: { type: String }, 
  timestamp: { type: Date, default: Date.now } 
});

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;

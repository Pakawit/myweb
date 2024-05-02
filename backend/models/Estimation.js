const mongoose = require("mongoose");

const EstimationSchema = new mongoose.Schema({
  painLevel: Number,
  photos: [String], 
  hfsLevel: {type: Number ,default: 0},
  from: String,
  time: String,
  date: String,
  to: String,
});

const Estimation = mongoose.model("Estimation", EstimationSchema);

module.exports = Estimation;

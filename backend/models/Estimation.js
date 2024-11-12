const mongoose = require("mongoose");

const EstimationSchema = new mongoose.Schema({
  painLevel: { type: Number, required: true },
  photos: { type: [String], required: true }, 
  hfsLevel: { type: Number ,default: 0  },
  from: { type: String, required: true },
  time: String,
  date: String,
  to: { type: String, required: true },
});

const Estimation = mongoose.model("Estimation", EstimationSchema);

module.exports = Estimation;

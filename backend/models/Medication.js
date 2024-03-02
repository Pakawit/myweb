const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  status: Number,
  from: String,
  time: String,
  date: String,
  to: String,
});

const Medication = mongoose.model("Medication", MedicationSchema);

module.exports = Medication;

const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  status: { type: Number, required: true },
  from: { type: String, required: true },
  time: String,
  date: String,
});

const Medication = mongoose.model("Medication", MedicationSchema);

module.exports = Medication;

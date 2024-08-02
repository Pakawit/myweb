const mongoose = require("mongoose");

const MedNotiSchema = new mongoose.Schema({
  morningTime: String,
  eveningTime: String,
});

const MedNoti = mongoose.model("MedNoti", MedNotiSchema);

module.exports = MedNoti;

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  from: { type: String, required: true },
  time: String,
  date: String,
  to: { type: String, required: true },
  contentType: { type: String, required: true },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;

const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  contact: {
    required: true,
    type: Number,
  },
  email: {
    required: true,
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("account", AccountSchema);

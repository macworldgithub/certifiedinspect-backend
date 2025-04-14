const mongoose = require("mongoose");

const RequestAccountSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("RequestAccounts", RequestAccountSchema);

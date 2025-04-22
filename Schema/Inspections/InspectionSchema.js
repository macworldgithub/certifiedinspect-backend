const mongoose = require("mongoose");

const InspectionSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'inspections',
  versionKey: false
});
module.exports= mongoose.model('Inspection', InspectionSchema);
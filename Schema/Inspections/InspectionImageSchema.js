const mongoose = require("mongoose");

const InspectionImageSchema = new mongoose.Schema({
  id: { type: Number },
  review_id: { type: Number },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'inspection_images',
  versionKey: false
});
module.exports = mongoose.model('InspectionImage', InspectionImageSchema);
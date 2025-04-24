const mongoose = require("mongoose");


const UserInspectionImageSchema = new mongoose.Schema({
  id: { type: Number },
  user_inspection_id: { type: String },
  image_title: { type: String },
  image_type: { type: Number },
  image_src: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'user_inspection_images',
  versionKey: false
});
module.exports = mongoose.model('UserInspectionImage', UserInspectionImageSchema);
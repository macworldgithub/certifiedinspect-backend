const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
  location: { type: String },
  password: { type: String },
  profile_image: { type: String },
  user_step: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  user_role_id: { type: Number, default: 2 },
  user_type: { type: Boolean },
  remember_token: { type: String },
  forgot_pass_date: { type: Date },
  verification_link: { type: String },
  refer_code: { type: String },
  is_paid: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'users',
  versionKey: false
});
module.exports = mongoose.model('User', UserSchema);
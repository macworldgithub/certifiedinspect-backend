const mongoose = require('mongoose');

// Schema for `app_config`
const AppConfigSchema = new mongoose.Schema({
  id: { type: Number },
  title: { type: String },
  value: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'app_config',
  versionKey: false
});
module.exports.AppConfig = mongoose.model('AppConfig', AppConfigSchema);

// Schema for `damages`
const DamageSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'damages',
  versionKey: false
});
module.exports.Damage = mongoose.model('Damage', DamageSchema);

// Schema for `email_verification`
const EmailVerificationSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  verification_code: { type: String },
  expires_at: { type: Date },
  created_at: { type: Date },
  modified_at: { type: Date },
  deleted_at: { type: Date },
}, {
  collection: 'email_verification',
  versionKey: false
});
module.exports.EmailVerification = mongoose.model('EmailVerification', EmailVerificationSchema);

// Schema for `failed_jobs`
const FailedJobSchema = new mongoose.Schema({
  id: { type: Number },
  connection: { type: String },
  queue: { type: String },
  payload: { type: String },
  exception: { type: String },
  failed_at: { type: Date, default: Date.now },
}, {
  collection: 'failed_jobs',
  versionKey: false
});
module.exports.FailedJob = mongoose.model('FailedJob', FailedJobSchema);

// Schema for `forgot_password`
const ForgotPasswordSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  verification_token: { type: String },
  expired_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'forgot_password',
  versionKey: false
});
module.exports.ForgotPassword = mongoose.model('ForgotPassword', ForgotPasswordSchema);

// Schema for `inspection_audit_logs`
const InspectionAuditLogSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  user_inspection_id: { type: Number },
  message: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'inspection_audit_logs',
  versionKey: false
});
module.exports.InspectionAuditLog = mongoose.model('InspectionAuditLog', InspectionAuditLogSchema);

// Schema for `inspection_images`
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
module.exports.InspectionImage = mongoose.model('InspectionImage', InspectionImageSchema);

// Schema for `inspections`
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
module.exports.Inspection = mongoose.model('Inspection', InspectionSchema);

// Schema for `jobs`
const JobSchema = new mongoose.Schema({
  id: { type: Number },
  queue: { type: String },
  payload: { type: String },
  attempts: { type: Number },
  reserved_at: { type: Number },
  available_at: { type: Number },
  created_at: { type: Number },
}, {
  collection: 'jobs',
  versionKey: false
});
module.exports.Job = mongoose.model('Job', JobSchema);

// Schema for `notification_types`
const NotificationTypeSchema = new mongoose.Schema({
  id: { type: Number },
  title: { type: String },
  description: { type: String },
  notification_for: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_At: { type: Date },
}, {
  collection: 'notification_types',
  versionKey: false
});
module.exports.NotificationType = mongoose.model('NotificationType', NotificationTypeSchema);

// Schema for `notifications`
const NotificationSchema = new mongoose.Schema({
  id: { type: Number },
  notification_type_id: { type: Number },
  from_user_id: { type: Number },
  to_user_id: { type: Number },
  inspect_id: { type: Number },
  added_user_id: { type: Number },
  is_read: { type: Boolean, default: false },
  is_sent: { type: Boolean, default: false },
  message: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'notifications',
  versionKey: false
});
module.exports.Notification = mongoose.model('Notification', NotificationSchema);

// Schema for `role`
const RoleSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
}, {
  collection: 'role',
  versionKey: false
});
module.exports.Role = mongoose.model('Role', RoleSchema);

// Schema for `schema_version`
const SchemaVersionSchema = new mongoose.Schema({
  installed_rank: { type: Number },
  version: { type: String },
  description: { type: String },
  type: { type: String },
  script: { type: String },
  checksum: { type: Number },
  installed_by: { type: String },
  installed_on: { type: Date, default: Date.now },
  execution_time: { type: Number },
  success: { type: Boolean },
}, {
  collection: 'schema_version',
  versionKey: false
});
module.exports.SchemaVersion = mongoose.model('SchemaVersion', SchemaVersionSchema);

// Schema for `sessions`
const SessionSchema = new mongoose.Schema({
  id: { type: String },
  user_id: { type: Number },
  ip_address: { type: String },
  user_agent: { type: String },
  payload: { type: String },
  last_activity: { type: Number },
}, {
  collection: 'sessions',
  versionKey: false
});
module.exports.Session = mongoose.model('Session', SessionSchema);

// Schema for `user_devices`
const UserDeviceSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  device_type: { type: Number },
  user_token: { type: String },
  device_token: { type: String },
  badge: { type: Number },
  is_logged_out: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'user_devices',
  versionKey: false
});
module.exports.UserDevice = mongoose.model('UserDevice', UserDeviceSchema);

// Schema for `user_inspection_clients`
const UserInspectionClientSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  name: { type: String },
  email: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
  deleted_at: { type: Date },
}, {
  collection: 'user_inspection_clients',
  versionKey: false
});
module.exports.UserInspectionClient = mongoose.model('UserInspectionClient', UserInspectionClientSchema);

// Schema for `user_inspection_damages`
const UserInspectionDamageSchema = new mongoose.Schema({
  id: { type: Number },
  user_inspection_id: { type: Number },
  damage_type: { type: String },
  description: { type: String },
  repair_cost: { type: String },
  damage_image: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'user_inspection_damages',
  versionKey: false
});
module.exports.UserInspectionDamage = mongoose.model('UserInspectionDamage', UserInspectionDamageSchema);

// Schema for `user_inspection_images`
const UserInspectionImageSchema = new mongoose.Schema({
  id: { type: Number },
  user_inspection_id: { type: Number },
  image_title: { type: String },
  image_type: { type: Boolean },
  image_src: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'user_inspection_images',
  versionKey: false
});
module.exports.UserInspectionImage = mongoose.model('UserInspectionImage', UserInspectionImageSchema);

// Schema for `user_inspections`
const UserInspectionSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  inspect_id: { type: String },
  status: { type: Boolean, default: true },
  is_paid: { type: Boolean, default: false },
  vehicle_year: { type: String },
  vehicle_make: { type: String },
  vehicle_model: { type: String },
  vehicle_vin: { type: String },
  vehicle_plate_no: { type: String },
  build_date: { type: String },
  comp_date: { type: String },
  no_of_keys: { type: Boolean, default: true },
  servicebook_present: { type: String },
  servicehistory_present: { type: String },
  last_service_date: { type: String },
  registration_expiry: { type: String },
  last_mileage: { type: String },
  front_wheel_d: { type: String },
  rear_wheel_d: { type: String },
  cond_front_left: { type: String },
  cond_front_right: { type: String },
  cond_rear_right: { type: String },
  cond_rear_left: { type: String },
  cond_spare: { type: String },
  transmission: { type: String },
  body_type: { type: String },
  odometer: { type: String },
  fuel_type: { type: String },
  drive_train: { type: String },
  color: { type: String },
  road_test: { type: String },
  road_test_comments: { type: String },
  general_comments: { type: String },
  is_pdf_generated: { type: Boolean, default: false },
  is_locked: { type: Boolean, default: false },
  locked_by: { type: String },
  approved_by: { type: String },
  approved_on: { type: Date },
  report_date: { type: Date },
  inspector_notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
  page_status: { type: Boolean, default: false },
}, {
  collection: 'user_inspections',
  versionKey: false
});
module.exports.UserInspection = mongoose.model('UserInspection', UserInspectionSchema);

// Schema for `users`
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
module.exports.User = mongoose.model('User', UserSchema);

// Schema for `vehicle_makes`
const VehicleMakeSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date },
}, {
  collection: 'vehicle_makes',
  versionKey: false
});
module.exports.VehicleMake = mongoose.model('VehicleMake', VehicleMakeSchema);

// Schema for `verification_tokens`
const VerificationTokenSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  token: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
  deleted_at: { type: Date },
  modified_at: { type: Date, default: Date.now },
}, {
  collection: 'verification_tokens',
  versionKey: false
});
module.exports.VerificationToken = mongoose.model('VerificationToken', VerificationTokenSchema);

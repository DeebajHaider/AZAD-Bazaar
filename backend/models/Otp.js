const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  isNewUser: { type: Boolean, default: false },
  // optional link to an existing Customer (for login flow)
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  createdAt: { type: Date, default: Date.now }
});

OtpSchema.index({ phone: 1, expiresAt: 1 });

module.exports = mongoose.model('Otp', OtpSchema);

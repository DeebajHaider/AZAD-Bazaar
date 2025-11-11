const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // phone number used to authenticate (no password)
  phone: { type: String, required: true, unique: true, index: true },

  // optional link to a Customer document (defined elsewhere). We'll populate
  // or create the Customer document in a later step of the app.
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

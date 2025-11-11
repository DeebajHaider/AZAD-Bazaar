const mongoose = require('mongoose');

// Minimal Customer model matching the larger Customer schema in databsaseInfo.txt
// We keep it small for now and will expand later.
const CustomerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema);

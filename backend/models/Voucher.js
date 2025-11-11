const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  value: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['flat', 'percentage', 'freeItem'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  generatedBy: { type: String, default: 'admin' },
  mustBeUsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', VoucherSchema);

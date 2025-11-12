const mongoose = require('mongoose');

// Customer model updated to store addresses as an array (single-item for now)
const AddressSchema = new mongoose.Schema({
  addressId: { type: String, required: true },
  label: { type: String, default: 'Home' },
  addressText: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isDefault: { type: Boolean, default: true }
}, { _id: false });

// Cart item schema embedded in Customer
const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const CurrentCartSchema = new mongoose.Schema({
  lastUpdated: { type: Date, default: Date.now },
  items: { type: [CartItemSchema], default: [] },
  vouchers: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }], default: [] }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  addresses: { type: [AddressSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Keep updatedAt current
CustomerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// attach currentCart schema as a non-discriminated child
CustomerSchema.add({
  currentCart: { type: CurrentCartSchema, default: () => ({}) }
});

module.exports = mongoose.model('Customer', CustomerSchema);

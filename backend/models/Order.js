const mongoose = require('mongoose');

const BulkDiscountSchema = new mongoose.Schema({
  quantity: { type: Number, required: true, min: 1 },
  discountAmount: { type: Number, required: true, min: 0 }
}, { _id: false });

const ProductSnapshotSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  photo: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  bulkDiscounts: { type: [BulkDiscountSchema], default: [] }
}, { _id: false });

const StatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending','confirmed','shipped','delivered','canceled'], required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customName: { type: String, default: '' },
  address: {
    label: { type: String, required: true },
    addressText: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  paymentMethod: {
    name: { type: String, required: true },
    type: { type: String, required: true },
    last4Digits: { type: String }
  },
  products: { type: [ProductSnapshotSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  deliveryInstructions: { type: String, default: '' },
  vouchersUsed: { type: [mongoose.Schema.Types.ObjectId], ref: 'Voucher', default: [] },
  coinsGenerated: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  discountApplied: { type: Number, default: 0, min: 0 },
  totalPaid: { type: Number, required: true, min: 0 },
  statusHistory: { type: [StatusSchema], default: [{ status: 'pending', timestamp: Date.now() }] },
  assignedDeliveryPersonId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

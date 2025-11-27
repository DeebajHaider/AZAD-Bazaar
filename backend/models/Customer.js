const mongoose = require('mongoose');

// NEW: Sub-schema for saved mobile wallets
const MobileWalletSchema = new mongoose.Schema({
  provider: { 
    type: String, 
    required: true, 
    enum: ['Jazzcash', 'Easypaisa'] // Ensures data consistency
  },
  mobileNumber: { type: String, required: true }
}, { _id: false }); // _id is not needed here, as a customer will have max one of each provider

// NEW: Sub-schema for saved credit cards
const CreditCardSchema = new mongoose.Schema({
  // We will let Mongoose automatically create a unique _id for each card
  last4Digits: { type: String, required: true },
  brand: { type: String, required: true }, // e.g., 'Visa', 'Mastercard'
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  isDefault: { type: Boolean, default: false } // To track the default card
});

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
  updatedAt: { type: Date, default: Date.now },
  favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] }, 
  paymentMethods: {
    mobileWallets: { type: [MobileWalletSchema], default: [] },
    creditCards: { type: [CreditCardSchema], default: [] }
  },
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

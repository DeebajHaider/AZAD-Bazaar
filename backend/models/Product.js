const mongoose = require('mongoose');

const BulkDiscountSchema = new mongoose.Schema({
  quantity: { type: Number, required: true, min: 1 },
  discountAmount: { type: Number, required: true, min: 0 }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  description: { type: String, maxlength: 1000, default: '' },
  images: { type: [String], default: [] },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  originalPrice: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, required: true, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 },
  bulkDiscounts: { type: [BulkDiscountSchema], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

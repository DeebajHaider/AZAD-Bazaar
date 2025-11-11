const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  // parentCategoryIds: allow multiple parent categories for flexible hierarchies
  parentCategoryIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);

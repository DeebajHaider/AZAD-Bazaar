// Remove product from cart directly (by productId)
exports.removeProductFromCart = async (req, res) => {
  try {
    console.log('removeProductFromCart called', { body: req.body, user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    const { productId } = req.body;
    if (!user || !user.customerId) return res.status(400).json({ message: 'Customer not linked to user' });
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid productId' });

    const cid = user.customerId;
    const pullResult = await Customer.findOneAndUpdate(
      { _id: cid },
      { $pull: { 'currentCart.items': { productId: new mongoose.Types.ObjectId(productId) } }, $set: { 'currentCart.lastUpdated': new Date() } },
      { new: true }
    ).lean();

    if (!pullResult) return res.status(404).json({ message: 'Customer not found' });
    console.log('removeProductFromCart pullResult', { customerId: cid, items: pullResult.currentCart ? pullResult.currentCart.items.length : 0 });
    const items = (pullResult.currentCart.items || []).map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));
    const ids = items.map((i) => i.productId).filter(Boolean);
    const products = ids.length ? await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1, images: 1 }).lean() : [];
    return res.json({ items, products });
  } catch (err) {
    console.error('removeProductFromCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Helper to normalize an incoming single address into addresses array
function buildAddressesFromPayload(body) {
  // Accept either body.address (string) or body.addresses (array)
  if (Array.isArray(body.addresses) && body.addresses.length > 0) return body.addresses;
  if (body.addresses && typeof body.addresses === 'string') {
    return [{ addressId: new mongoose.Types.ObjectId().toString(), label: 'Home', addressText: body.addresses, lat: body.lat || null, lng: body.lng || null, isDefault: true }];
  }
  if (body.address && typeof body.address === 'string') {
    return [{ addressId: new mongoose.Types.ObjectId().toString(), label: 'Home', addressText: body.address, lat: body.lat || null, lng: body.lng || null, isDefault: true }];
  }
  return [];
}

exports.createCustomer = async (req, res) => {
  try {
    const payload = { ...req.body };
    // normalize address -> addresses array
    const addresses = buildAddressesFromPayload(req.body);
    if (addresses.length) payload.addresses = addresses;

    const doc = await Customer.create(payload);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createCustomer error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listCustomers = async (req, res) => {
  try {
    const docs = await Customer.find().limit(200).lean();
    return res.json(docs);
  } catch (err) {
    console.error('listCustomers error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const doc = await Customer.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getCustomer error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

// Update customer: only allow name and address changes for now (phone cannot be changed)
exports.updateCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });

    // Disallow phone updates
    if (req.body.phone) return res.status(400).json({ message: 'Phone update not allowed' });

    const update = {};
    if (typeof req.body.name !== 'undefined') update.name = req.body.name;

    const addresses = buildAddressesFromPayload(req.body);
    if (addresses.length) update.addresses = addresses;

    update.updatedAt = Date.now();

    const doc = await Customer.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('updateCustomer error', err);
    return res.status(400).json({ message: err.message });
  }
};

// --- Cart APIs ---
// Get cart for current authenticated user (requires req.user from authMiddleware)
exports.getCart = async (req, res) => {
  try {
    console.log('getCart called', { user: req.user ? { id: req.user._id, phone: req.user.phone, customerId: req.user.customerId } : null });
    const user = req.user;
    if (!user || !user.customerId) return res.json({ items: [], products: [] });

    const customer = await Customer.findById(user.customerId).lean();
    if (!customer || !customer.currentCart || !customer.currentCart.items.length) {
      return res.json({ items: [], products: [] });
    }

    const items = customer.currentCart.items.map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));

    // Fetch product minimal details
    const ids = items.map((i) => i.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1 }).lean();

    console.log('getCart returning', { itemsCount: items.length, productsCount: products.length });

    return res.json({ items, products });
  } catch (err) {
    console.error('getCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add product to cart: body:{ productId }
exports.addProductToCart = async (req, res) => {
  try {
    console.log('addProductToCart called', { body: req.body, user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    const { productId } = req.body;
    if (!user || !user.customerId) return res.status(400).json({ message: 'Customer not linked to user' });
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid productId' });

    const product = await Product.findById(productId).lean();
    console.log('addProductToCart product loaded', { productId, exists: !!product, stockQuantity: product ? product.stockQuantity : null });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.stockQuantity || product.stockQuantity <= 0) return res.status(400).json({ message: 'Product out of stock' });

    const cid = user.customerId;

    const incrementResult = await Customer.findOneAndUpdate(
      {
        _id: cid,
        'currentCart.items': {
          $elemMatch: {
            productId: new mongoose.Types.ObjectId(productId)
          }
        }
      },
      {
        $inc: { 'currentCart.items.$.quantity': 1 },
        $set: { 'currentCart.items.$.addedAt': new Date(), 'currentCart.lastUpdated': new Date() }
      },
      { new: true }
    ).lean();

    if (incrementResult) {
      console.log('addProductToCart incrementResult', { customerId: cid, items: incrementResult.currentCart ? incrementResult.currentCart.items.length : 0 });
      // return same shape as getCart: { items, products }
      const items = (incrementResult.currentCart.items || []).map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));
      const ids = items.map((i) => i.productId).filter(Boolean);
      const products = ids.length ? await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1, images: 1 }).lean() : [];
      return res.json({ items, products });
    }

    // Otherwise push new item
    const newItem = { productId: new mongoose.Types.ObjectId(productId), quantity: 1, addedAt: new Date() };
    const pushResult = await Customer.findOneAndUpdate(
      { _id: cid },
      { $push: { 'currentCart.items': newItem }, $set: { 'currentCart.lastUpdated': new Date() } },
      { new: true }
    ).lean();

    if (!pushResult) return res.status(404).json({ message: 'Customer not found' });
    console.log('addProductToCart pushResult', { customerId: cid, items: pushResult.currentCart ? pushResult.currentCart.items.length : 0 });
    const items = (pushResult.currentCart.items || []).map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));
    const ids = items.map((i) => i.productId).filter(Boolean);
    const products = ids.length ? await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1, images: 1 }).lean() : [];
    return res.json({ items, products });
  } catch (err) {
    console.error('addProductToCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Decrement product quantity in cart (remove if 0). body:{ productId }
exports.decrementProductInCart = async (req, res) => {
  try {
    console.log('decrementProductInCart called', { body: req.body, user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    const { productId } = req.body;
    if (!user || !user.customerId) return res.status(400).json({ message: 'Customer not linked to user' });
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid productId' });

    const cid = user.customerId;

    // FIX: Use $elemMatch to ensure BOTH conditions match the SAME array element
    const decResult = await Customer.findOneAndUpdate(
      {
        _id: cid,
        'currentCart.items': {
          $elemMatch: {
            productId: new mongoose.Types.ObjectId(productId),
            quantity: { $gt: 1 }
          }
        }
      },
      {
        $inc: { 'currentCart.items.$.quantity': -1 },
        $set: { 'currentCart.items.$.addedAt': new Date(), 'currentCart.lastUpdated': new Date() }
      },
      { new: true }
    ).lean();

    if (decResult) {
      console.log('decrementProductInCart decResult', { customerId: cid, items: decResult.currentCart ? decResult.currentCart.items.length : 0 });
      const items = (decResult.currentCart.items || []).map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));
      const ids = items.map((i) => i.productId).filter(Boolean);
      const products = ids.length ? await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1, images: 1 }).lean() : [];
      return res.json({ items, products });
    }

    // Otherwise remove the item completely
    const pullResult = await Customer.findOneAndUpdate(
      { _id: cid },
      { $pull: { 'currentCart.items': { productId: new mongoose.Types.ObjectId(productId) } }, $set: { 'currentCart.lastUpdated': new Date() } },
      { new: true }
    ).lean();

    if (!pullResult) return res.status(404).json({ message: 'Customer not found' });
    console.log('decrementProductInCart pullResult', { customerId: cid, items: pullResult.currentCart ? pullResult.currentCart.items.length : 0 });
    const items = (pullResult.currentCart.items || []).map((it) => ({ productId: it.productId, quantity: it.quantity, addedAt: it.addedAt }));
    const ids = items.map((i) => i.productId).filter(Boolean);
    const products = ids.length ? await Product.find({ _id: { $in: ids } }, { name: 1, discountedPrice: 1, originalPrice: 1, bulkDiscounts: 1, images: 1 }).lean() : [];
    return res.json({ items, products });
  } catch (err) {
    console.error('decrementProductInCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart (server-side): empties currentCart.items
exports.clearCart = async (req, res) => {
  try {
    console.log('clearCart called', { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    if (!user || !user.customerId) return res.status(400).json({ message: 'Customer not linked to user' });

    const cid = user.customerId;
    const result = await Customer.findOneAndUpdate(
      { _id: cid },
      { $set: { 'currentCart.items': [], 'currentCart.lastUpdated': new Date() } },
      { new: true }
    ).lean();

    if (!result) return res.status(404).json({ message: 'Customer not found' });
    console.log('clearCart success', { customerId: cid });
    // return empty cart shape
    return res.json({ items: [], products: [] });
  } catch (err) {
    console.error('clearCart error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.getFavorites = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.customerId)
      return res.json({ favorites: [] });

    const customer = await Customer.findById(user.customerId, { favorites: 1 }).lean();
    return res.json({ favorites: customer?.favorites ?? [] });
  } catch (err) {
    console.error("getFavorites error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.body;

    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    if (!productId)
      return res.status(400).json({ message: "productId required" });

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $addToSet: { favorites: new mongoose.Types.ObjectId(productId) } },
      { new: true, select: "favorites" }
    ).lean();

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    return res.json({ favorites: customer.favorites });
  } catch (err) {
    console.error("addFavorite error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.body;

    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    if (!productId)
      return res.status(400).json({ message: "productId required" });

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $pull: { favorites: new mongoose.Types.ObjectId(productId) } },
      { new: true, select: "favorites" }
    ).lean();

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    return res.json({ favorites: customer.favorites });
  } catch (err) {
    console.error("removeFavorite error", err);
    return res.status(500).json({ message: "Server error" });
  }
};



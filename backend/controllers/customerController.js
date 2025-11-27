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

// --- Address Management APIs ---

// Get all addresses for the current user
exports.getAddresses = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    const customer = await Customer.findById(user.customerId, { addresses: 1 }).lean();
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    return res.json({ addresses: customer.addresses || [] });
  } catch (err) {
    console.error("getAddresses error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    const { label, addressText, lat, lng, isDefault } = req.body;
    if (!addressText)
      return res.status(400).json({ message: "addressText is required" });

    const newAddress = {
      addressId: new mongoose.Types.ObjectId().toString(),
      label: label || 'Home',
      addressText,
      lat: lat || null,
      lng: lng || null,
      isDefault: isDefault || false
    };

    let customer;
    if (isDefault) {
      // Step 1: Unset all other defaults
      await Customer.updateOne(
        { _id: user.customerId },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }
    // Step 2: Push the new address
    customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $push: { addresses: newAddress } },
      { new: true, select: "addresses" }
    ).lean();

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Step 3: If isDefault, set the new address as default
    if (isDefault) {
      const updated = await Customer.findOneAndUpdate(
        { _id: user.customerId, 'addresses.addressId': newAddress.addressId },
        { $set: { 'addresses.$.isDefault': true } },
        { new: true, select: "addresses" }
      ).lean();
      return res.json({ addresses: updated.addresses || [] });
    }
    return res.json({ addresses: customer.addresses || [] });
  } catch (err) {
    console.error("addAddress error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update an existing address by addressId
exports.updateAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    const { addressId, label, addressText, lat, lng, isDefault } = req.body;
    if (!addressId)
      return res.status(400).json({ message: "addressId is required" });

    const customer = await Customer.findById(user.customerId).lean();
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const addressExists = customer.addresses?.some(a => a.addressId === addressId);
    if (!addressExists)
      return res.status(404).json({ message: "Address not found" });

    // Build update object for the matched address
    const updateFields = {};
    if (label !== undefined) updateFields['addresses.$.label'] = label;
    if (addressText !== undefined) updateFields['addresses.$.addressText'] = addressText;
    if (lat !== undefined) updateFields['addresses.$.lat'] = lat;
    if (lng !== undefined) updateFields['addresses.$.lng'] = lng;
    if (isDefault !== undefined) updateFields['addresses.$.isDefault'] = isDefault;

    // If setting this as default, first unset all defaults
    if (isDefault) {
      await Customer.findByIdAndUpdate(
        user.customerId,
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const updated = await Customer.findOneAndUpdate(
      { _id: user.customerId, 'addresses.addressId': addressId },
      { $set: updateFields },
      { new: true, select: "addresses" }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    return res.json({ addresses: updated.addresses || [] });
  } catch (err) {
    console.error("updateAddress error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete an address by addressId
exports.deleteAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.customerId)
      return res.status(401).json({ message: "Unauthorized" });

    const { addressId } = req.body;
    if (!addressId)
      return res.status(400).json({ message: "addressId is required" });

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $pull: { addresses: { addressId } } },
      { new: true, select: "addresses" }
    ).lean();

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    return res.json({ addresses: customer.addresses || [] });
  } catch (err) {
    console.error("deleteAddress error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Mobile Wallet Management APIs ---

// Get all mobile wallets for the current user
exports.getMobileWallets = async (req, res) => {
  try {
    console.log("getMobileWallets called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("getMobileWallets: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customer = await Customer.findById(user.customerId, { 'paymentMethods.mobileWallets': 1 }).lean();
    if (!customer) {
      console.log("getMobileWallets: Customer not found", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("getMobileWallets: returning", { mobileWallets: customer.paymentMethods?.mobileWallets?.length });
    return res.json({ mobileWallets: customer.paymentMethods?.mobileWallets || [] });
  } catch (err) {
    console.error("getMobileWallets error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new mobile wallet (max 2: one Jazzcash, one Easypaisa)
exports.addMobileWallet = async (req, res) => {
  try {
    console.log("addMobileWallet called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null, body: req.body });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("addMobileWallet: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { provider, mobileNumber } = req.body;
    
    if (!provider || !mobileNumber) {
      console.log("addMobileWallet: provider and mobileNumber required", { provider, mobileNumber });
      return res.status(400).json({ message: "provider and mobileNumber are required" });
    }

    if (!['Jazzcash', 'Easypaisa'].includes(provider)) {
      console.log("addMobileWallet: Invalid provider", { provider });
      return res.status(400).json({ message: "Invalid provider. Must be Jazzcash or Easypaisa" });
    }

    // Check if wallet with this provider already exists
    const existingCustomer = await Customer.findById(user.customerId).lean();
    if (!existingCustomer) {
      console.log("addMobileWallet: Customer not found", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    const walletExists = existingCustomer.paymentMethods?.mobileWallets?.some(
      wallet => wallet.provider === provider
    );

    if (walletExists) {
      console.log("addMobileWallet: Wallet already exists", { provider });
      return res.status(400).json({ message: `${provider} wallet already exists. You can only have one wallet per provider.` });
    }

    const newWallet = { provider, mobileNumber };

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $push: { 'paymentMethods.mobileWallets': newWallet } },
      { new: true, select: 'paymentMethods.mobileWallets' }
    ).lean();

    if (!customer) {
      console.log("addMobileWallet: Customer not found after update", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("addMobileWallet: returning", { mobileWallets: customer.paymentMethods?.mobileWallets?.length });
    return res.json({ mobileWallets: customer.paymentMethods?.mobileWallets || [] });
  } catch (err) {
    console.error("addMobileWallet error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update mobile wallet - only allows changing the phone number
exports.updateMobileWallet = async (req, res) => {
  try {
    console.log("updateMobileWallet called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null, body: req.body });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("updateMobileWallet: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { provider, mobileNumber } = req.body;
    
    if (!provider) {
      console.log("updateMobileWallet: provider required");
      return res.status(400).json({ message: "provider is required" });
    }

    if (!mobileNumber) {
      console.log("updateMobileWallet: mobileNumber required");
      return res.status(400).json({ message: "mobileNumber is required" });
    }

    if (!['Jazzcash', 'Easypaisa'].includes(provider)) {
      console.log("updateMobileWallet: Invalid provider", { provider });
      return res.status(400).json({ message: "Invalid provider. Must be Jazzcash or Easypaisa" });
    }

    const customer = await Customer.findById(user.customerId).lean();
    if (!customer) {
      console.log("updateMobileWallet: Customer not found", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    const walletExists = customer.paymentMethods?.mobileWallets?.some(
      wallet => wallet.provider === provider
    );

    if (!walletExists) {
      console.log("updateMobileWallet: Wallet not found", { provider });
      return res.status(404).json({ message: "Mobile wallet not found" });
    }

    const updated = await Customer.findOneAndUpdate(
      { _id: user.customerId, 'paymentMethods.mobileWallets.provider': provider },
      { $set: { 'paymentMethods.mobileWallets.$.mobileNumber': mobileNumber } },
      { new: true, select: 'paymentMethods.mobileWallets' }
    ).lean();

    if (!updated) {
      console.log("updateMobileWallet: Customer not found after update", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("updateMobileWallet: returning", { mobileWallets: updated.paymentMethods?.mobileWallets?.length });
    return res.json({ mobileWallets: updated.paymentMethods?.mobileWallets || [] });
  } catch (err) {
    console.error("updateMobileWallet error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a mobile wallet by provider
exports.deleteMobileWallet = async (req, res) => {
  try {
    console.log("deleteMobileWallet called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null, body: req.body });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("deleteMobileWallet: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { provider } = req.body;
    
    if (!provider) {
      console.log("deleteMobileWallet: provider required");
      return res.status(400).json({ message: "provider is required" });
    }

    if (!['Jazzcash', 'Easypaisa'].includes(provider)) {
      console.log("deleteMobileWallet: Invalid provider", { provider });
      return res.status(400).json({ message: "Invalid provider. Must be Jazzcash or Easypaisa" });
    }

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $pull: { 'paymentMethods.mobileWallets': { provider } } },
      { new: true, select: 'paymentMethods.mobileWallets' }
    ).lean();

    if (!customer) {
      console.log("deleteMobileWallet: Customer not found after update", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("deleteMobileWallet: returning", { mobileWallets: customer.paymentMethods?.mobileWallets?.length });
    return res.json({ mobileWallets: customer.paymentMethods?.mobileWallets || [] });
  } catch (err) {
    console.error("deleteMobileWallet error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Credit Card Management APIs ---

// Get all credit cards for the current user
exports.getCreditCards = async (req, res) => {
  try {
    console.log("getCreditCards called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("getCreditCards: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customer = await Customer.findById(user.customerId, { 'paymentMethods.creditCards': 1 }).lean();
    if (!customer) {
      console.log("getCreditCards: Customer not found", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("getCreditCards: returning", { creditCards: customer.paymentMethods?.creditCards?.length });
    return res.json({ creditCards: customer.paymentMethods?.creditCards || [] });
  } catch (err) {
    console.error("getCreditCards error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add a new credit card
exports.addCreditCard = async (req, res) => {
  try {
    console.log("addCreditCard called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null, body: req.body });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("addCreditCard: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { last4Digits, brand, expiryMonth, expiryYear, isDefault } = req.body;
    
    if (!last4Digits || !brand || !expiryMonth || !expiryYear) {
      console.log("addCreditCard: Required fields missing", { last4Digits, brand, expiryMonth, expiryYear });
      return res.status(400).json({ message: "last4Digits, brand, expiryMonth, and expiryYear are required" });
    }

    // Validate last4Digits
    if (!/^\d{4}$/.test(last4Digits)) {
      console.log("addCreditCard: Invalid last4Digits", { last4Digits });
      return res.status(400).json({ message: "last4Digits must be exactly 4 digits" });
    }

    // Validate expiry month and year
    if (expiryMonth < 1 || expiryMonth > 12) {
      console.log("addCreditCard: Invalid expiryMonth", { expiryMonth });
      return res.status(400).json({ message: "expiryMonth must be between 1 and 12" });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      console.log("addCreditCard: Card expired", { expiryMonth, expiryYear });
      return res.status(400).json({ message: "Card has expired" });
    }

    const newCard = {
      last4Digits,
      brand,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || false
    };

    let customer;
    // Ensure paymentMethods and creditCards array exist
    let ensure = await Customer.findById(user.customerId).lean();
    if (!ensure) {
      console.log("addCreditCard: Customer not found for initialization", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }
    let updateNeeded = false;
    const setObj = {};
    if (!ensure.paymentMethods) {
      setObj['paymentMethods'] = { creditCards: [] };
      updateNeeded = true;
    } else if (!Array.isArray(ensure.paymentMethods.creditCards)) {
      setObj['paymentMethods.creditCards'] = [];
      updateNeeded = true;
    }
    if (updateNeeded) {
      await Customer.updateOne({ _id: user.customerId }, { $set: setObj });
      ensure = await Customer.findById(user.customerId).lean();
    }

    if (isDefault) {
      // First, unset all other defaults
      console.log("addCreditCard: Unsetting all other defaults");
      await Customer.updateOne(
        { _id: user.customerId },
        { $set: { 'paymentMethods.creditCards.$[].isDefault': false } }
      );
    }

    // Push the new card
    customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $push: { 'paymentMethods.creditCards': newCard } },
      { new: true, select: 'paymentMethods.creditCards' }
    ).lean();

    if (!customer) {
      console.log("addCreditCard: Customer not found after update", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("addCreditCard: returning", { creditCards: customer.paymentMethods?.creditCards?.length });
    return res.json({ creditCards: customer.paymentMethods?.creditCards || [] });
  } catch (err) {
    console.error("addCreditCard error", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a credit card by card _id
exports.deleteCreditCard = async (req, res) => {
  try {
    console.log("deleteCreditCard called", { user: req.user ? { id: req.user._id, customerId: req.user.customerId } : null, body: req.body });
    const user = req.user;
    if (!user || !user.customerId) {
      console.log("deleteCreditCard: Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { cardId } = req.body;
    
    if (!cardId) {
      console.log("deleteCreditCard: cardId required");
      return res.status(400).json({ message: "cardId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      console.log("deleteCreditCard: Invalid cardId", { cardId });
      return res.status(400).json({ message: "Invalid cardId" });
    }

    const customer = await Customer.findByIdAndUpdate(
      user.customerId,
      { $pull: { 'paymentMethods.creditCards': { _id: new mongoose.Types.ObjectId(cardId) } } },
      { new: true, select: 'paymentMethods.creditCards' }
    ).lean();

    if (!customer) {
      console.log("deleteCreditCard: Customer not found after update", { customerId: user.customerId });
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("deleteCreditCard: returning", { creditCards: customer.paymentMethods?.creditCards?.length });
    return res.json({ creditCards: customer.paymentMethods?.creditCards || [] });
  } catch (err) {
    console.error("deleteCreditCard error", err);
    return res.status(500).json({ message: "Server error" });
  }
};



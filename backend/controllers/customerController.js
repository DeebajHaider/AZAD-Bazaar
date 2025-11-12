const Customer = require('../models/Customer');
const mongoose = require('mongoose');

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

const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const doc = await Customer.create(req.body);
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

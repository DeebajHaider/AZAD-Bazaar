const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const doc = await Order.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createOrder error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const docs = await Order.find().limit(200).lean();
    return res.json(docs);
  } catch (err) {
    console.error('listOrders error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const doc = await Order.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getOrder error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

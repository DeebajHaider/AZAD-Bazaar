const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const doc = await Product.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createProduct error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const docs = await Product.find().limit(100).lean();
    return res.json(docs);
  } catch (err) {
    console.error('listProducts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getProduct error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

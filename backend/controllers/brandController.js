const Brand = require('../models/Brand');

exports.createBrand = async (req, res) => {
  try {
    const doc = await Brand.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createBrand error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listBrands = async (req, res) => {
  try {
    const docs = await Brand.find().lean();
    return res.json(docs);
  } catch (err) {
    console.error('listBrands error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const doc = await Brand.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getBrand error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

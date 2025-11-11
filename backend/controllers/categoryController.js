const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const doc = await Category.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createCategory error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const docs = await Category.find().lean();
    return res.json(docs);
  } catch (err) {
    console.error('listCategories error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const doc = await Category.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getCategory error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

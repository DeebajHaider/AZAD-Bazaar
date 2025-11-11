const Voucher = require('../models/Voucher');

exports.createVoucher = async (req, res) => {
  try {
    const doc = await Voucher.create(req.body);
    return res.status(201).json(doc);
  } catch (err) {
    console.error('createVoucher error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listVouchers = async (req, res) => {
  try {
    const docs = await Voucher.find().lean();
    return res.json(docs);
  } catch (err) {
    console.error('listVouchers error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getVoucher = async (req, res) => {
  try {
    const doc = await Voucher.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getVoucher error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

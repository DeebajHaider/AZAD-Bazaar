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

exports.validateVoucher = async (req, res) => {
  try {
    const { voucherId, customerId } = req.body;
    if (!voucherId) {
      return res.status(400).json({ message: 'Voucher ID required' });
    }

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher' });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: 'Voucher is not active' });
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({ message: 'Voucher expired' });
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: 'Voucher usage limit reached' });
    }

    if (voucher.mustBeUsedBy && voucher.mustBeUsedBy.toString() !== customerId) {
      return res.status(400).json({ message: 'Voucher not valid for this customer' });
    }

    return res.json({ valid: true, voucher });
  } catch (err) {
    console.error('validateVoucher error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

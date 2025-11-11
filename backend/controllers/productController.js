const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

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
    // Parse query params
    const { name, categories, brands, instock, sort } = req.query;

    // Helper to parse array-like query params. Accepts: repeated params, comma-separated or JSON array string.
    const parseArrayParam = (p) => {
      if (!p) return null;
      if (Array.isArray(p)) return p.map(String);
      if (typeof p !== 'string') return null;
      const s = p.trim();
      if (!s) return null;
      if (s.startsWith('[')) {
        try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed.map(String); } catch(e) { /* fallthrough */ }
      }
      if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
      return [s];
    };

    const categoryArr = parseArrayParam(categories);
    const brandArr = parseArrayParam(brands);

    // Resolve category names (if provided) to IDs. Accept IDs directly as well.
    let categoryIds = null;
    if (categoryArr && categoryArr.length) {
      const ids = [];
      const names = [];
      for (const v of categoryArr) {
        if (mongoose.Types.ObjectId.isValid(v)) ids.push(new mongoose.Types.ObjectId(v));
        else names.push(v.trim());
      }
      if (names.length) {
        // case-insensitive exact match on category name
        const regexes = names.map(n => new RegExp('^' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'));
        const cats = await Category.find({ name: { $in: regexes } }).select('_id').lean();
        cats.forEach(c => ids.push(c._id));
      }
      if (ids.length) categoryIds = ids;
    }

    // Resolve brand names (if provided) to IDs. Accept IDs directly as well.
    let brandIds = null;
    if (brandArr && brandArr.length) {
      const ids = [];
      const names = [];
      for (const v of brandArr) {
        if (mongoose.Types.ObjectId.isValid(v)) ids.push(new mongoose.Types.ObjectId(v));
        else names.push(v.trim());
      }
      if (names.length) {
        const regexes = names.map(n => new RegExp('^' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i'));
        const brandsFound = await Brand.find({ name: { $in: regexes } }).select('_id').lean();
        brandsFound.forEach(b => ids.push(b._id));
      }
      if (ids.length) brandIds = ids;
    }

    // Build aggregation pipeline so we can lookup brand/category for sorting and return rich objects
    const pipeline = [];

    // Filters
    const match = {};

    if (name && typeof name === 'string' && name.trim()) {
      // case-insensitive substring match
      match.name = { $regex: name.trim(), $options: 'i' };
    }

    if (categoryIds) {
      match.$or = match.$or || [];
      match.$or.push({ categoryId: { $in: categoryIds } });
      match.$or.push({ subcategories: { $in: categoryIds } });
    }

    if (brandIds) {
      match.brandId = { $in: brandIds };
    }

    if (instock !== undefined) {
      const truthy = String(instock).toLowerCase();
      if (truthy === '1' || truthy === 'true') {
        // available when stockQuantity - reservedQuantity > 0
        // use $expr for arithmetic comparison
        pipeline.push({ $match: match });
        pipeline.push({
          $match: {
            $expr: { $gt: [ { $subtract: [ { $ifNull: ["$stockQuantity", 0] }, { $ifNull: ["$reservedQuantity", 0] } ] }, 0 ] }
          }
        });
      } else if (truthy === '0' || truthy === 'false') {
        pipeline.push({ $match: match });
        pipeline.push({
          $match: {
            $expr: { $lte: [ { $subtract: [ { $ifNull: ["$stockQuantity", 0] }, { $ifNull: ["$reservedQuantity", 0] } ] }, 0 ] }
          }
        });
      }
    } else {
      if (Object.keys(match).length) pipeline.push({ $match: match });
    }

    // Lookups so we can sort by brand name and also return related objects
    pipeline.push(
      { $lookup: { from: 'brands', localField: 'brandId', foreignField: '_id', as: 'brand' } },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    );

    // Sorting
    const sortObj = {};
    if (sort) {
      const s = String(sort).toLowerCase();
      if (s === 'name') sortObj.name = 1;
      else if (s === 'discountedprice' || s === 'discounted_price' || s === 'price') sortObj.discountedPrice = 1;
      else if (s === 'brand') sortObj['brand.name'] = 1;
    }

    if (Object.keys(sortObj).length) pipeline.push({ $sort: sortObj });

    // Default limit to 100 to avoid huge responses unless the client explicitly sets no limit via ?nolimit=1
    const docs = await Product.aggregate(pipeline).limit(200);
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

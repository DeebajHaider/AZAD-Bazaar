#!/usr/bin/env node
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const { connectMongo } = require('../initDB');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const OUT_FILE = path.join(__dirname, '..', 'translations_export.json');

async function groupTopLevel(model, field) {
  const pipeline = [
    { $match: { [field]: { $exists: true, $ne: '' } } },
    { $group: { _id: `$${field}`, docs: { $push: '$_id' }, count: { $sum: 1 } } },
    { $project: { value: '$_id', docs: 1, count: 1, _id: 0 } }
  ];
  return model.aggregate(pipeline).allowDiskUse(true);
}

async function groupUnwind(model, arrayPath, subField) {
  // arrayPath: 'products'  subField: 'name' -> $unwind products then group by products.name
  const pipeline = [
    { $unwind: `$${arrayPath}` },
    { $match: { [`${arrayPath}.${subField}`]: { $exists: true, $ne: '' } } },
    { $group: { _id: `$${arrayPath}.${subField}`, docs: { $push: '$_id' }, count: { $sum: 1 } } },
    { $project: { value: '$_id', docs: 1, count: 1, _id: 0 } }
  ];
  return model.aggregate(pipeline).allowDiskUse(true);
}

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in environment. Add it to a .env file in backend/');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await connectMongo();
  console.log('Connected. Extracting values...');

  const out = {
    generatedAt: new Date().toISOString(),
    models: []
  };

  // Brand: name, motto
  try {
    const brandNames = await groupTopLevel(Brand, 'name');
    const brandMottos = await groupTopLevel(Brand, 'motto');
    out.models.push({ model: 'Brand', field: 'name', entries: brandNames.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
    out.models.push({ model: 'Brand', field: 'motto', entries: brandMottos.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
  } catch (err) {
    console.warn('Brand extraction failed:', err.message || err);
  }

  // Category: name
  try {
    const categoryNames = await groupTopLevel(Category, 'name');
    out.models.push({ model: 'Category', field: 'name', entries: categoryNames.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
  } catch (err) {
    console.warn('Category extraction failed:', err.message || err);
  }

  // Product: name, description
  try {
    const productNames = await groupTopLevel(Product, 'name');
    const productDescriptions = await groupTopLevel(Product, 'description');
    out.models.push({ model: 'Product', field: 'name', entries: productNames.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
    out.models.push({ model: 'Product', field: 'description', entries: productDescriptions.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
  } catch (err) {
    console.warn('Product extraction failed:', err.message || err);
  }

  // Order: products.name, products.description, paymentMethod.name
  try {
    const orderProdNames = await groupUnwind(Order, 'products', 'name');
    const orderProdDescriptions = await groupUnwind(Order, 'products', 'description');
    const paymentNames = await groupTopLevel(Order, 'paymentMethod.name');
    out.models.push({ model: 'Order', field: 'products.name', entries: orderProdNames.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
    out.models.push({ model: 'Order', field: 'products.description', entries: orderProdDescriptions.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
    // paymentMethod.name may be nested; if pipeline returns empty, it's fine
    if (paymentNames && paymentNames.length) {
      out.models.push({ model: 'Order', field: 'paymentMethod.name', entries: paymentNames.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
    }
  } catch (err) {
    console.warn('Order extraction failed:', err.message || err);
  }

  // Customer: addresses.label (useful for default labels like 'Home')
  try {
    const addressLabels = await groupUnwind(Customer, 'addresses', 'label');
    out.models.push({ model: 'Customer', field: 'addresses.label', entries: addressLabels.map(e => ({ value: e.value, docs: e.docs.map(String), count: e.count, ur: '' })) });
  } catch (err) {
    console.warn('Customer extraction failed:', err.message || err);
  }

  // Write file
  try {
    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
    console.log('Export written to', OUT_FILE);
  } catch (err) {
    console.error('Failed to write output file:', err.message || err);
  }

  // Close connection and exit
  try {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  } catch (err) {
    // ignore
  }

  process.exit(0);
}

run().catch(err => {
  console.error('Extractor failed:', err);
  process.exit(1);
});

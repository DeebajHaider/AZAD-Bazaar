const Order = require('../models/Order');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  console.log('createOrder: Received request with body:', JSON.stringify(req.body, null, 2));
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, customName, address, paymentMethod, products, deliveryInstructions, vouchersUsed } = req.body;

    // Validate required fields
    if (!customerId || !address || !paymentMethod || !products || products.length === 0) {
      console.log('createOrder: Aborting transaction - Missing required fields');
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify customer exists
    console.log(`createOrder: Verifying customer with ID: ${customerId}`);
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      console.log('createOrder: Aborting transaction - Customer not found');
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Customer not found' });
    }
    console.log('createOrder: Customer verified:', customer.name);

    // Validate vouchers if any
    if (vouchersUsed && vouchersUsed.length > 0) {
      console.log('createOrder: Validating vouchers:', vouchersUsed);
      for (const voucherId of vouchersUsed) {
        const voucher = await Voucher.findById(voucherId).session(session);
        if (!voucher) {
          console.log(`createOrder: Aborting transaction - Invalid voucher ID: ${voucherId}`);
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: 'Invalid voucher' });
        }
        if (!voucher.isActive) {
          console.log(`createOrder: Aborting transaction - Voucher not active: ${voucherId}`);
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher is not active' });
        }
        const now = new Date();
        if (now < voucher.startDate || now > voucher.endDate) {
          console.log(`createOrder: Aborting transaction - Voucher expired: ${voucherId}`);
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher expired' });
        }
        if (voucher.usedCount >= voucher.usageLimit) {
          console.log(`createOrder: Aborting transaction - Voucher usage limit reached: ${voucherId}`);
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher usage limit reached' });
        }
        if (voucher.mustBeUsedBy && voucher.mustBeUsedBy.toString() !== customerId.toString()) {
          console.log(`createOrder: Aborting transaction - Voucher not valid for this customer: ${voucherId}`);
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher not valid for this customer' });
        }
      }
      console.log('createOrder: Vouchers validated successfully.');
    }

    // Verify stock and lock products
    console.log('createOrder: Verifying stock and calculating totals.');
    const productSnapshots = [];
    let subtotal = 0;
    let discountApplied = 0;

    for (const item of products) {
      console.log(`createOrder: Processing product ID: ${item.productId}, Quantity: ${item.quantity}`);
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        console.log(`createOrder: Aborting transaction - Product ${item.productId} not found`);
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const availableStock = product.stockQuantity - (product.reservedQuantity || 0);
      if (availableStock < item.quantity) {
        console.log(`createOrder: Aborting transaction - Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`);
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
        });
      }

      // Calculate price with bulk discounts
      let itemPrice = product.discountedPrice;
      let bulkDiscount = 0;
      
      if (product.bulkDiscounts && product.bulkDiscounts.length > 0) {
        const applicableDiscounts = product.bulkDiscounts
          .filter(bd => item.quantity >= bd.quantity)
          .sort((a, b) => b.discountAmount - a.discountAmount);
        
        if (applicableDiscounts.length > 0) {
          bulkDiscount = applicableDiscounts[0].discountAmount;
        }
      }

      const itemTotal = (itemPrice - bulkDiscount) * item.quantity;
      const originalTotal = product.originalPrice * item.quantity;
      const itemDiscount = originalTotal - itemTotal;

      subtotal += itemTotal;
      discountApplied += itemDiscount;

      console.log(`createOrder: Product: ${product.name}, Item Total: ${itemTotal}, Subtotal: ${subtotal}`);

      // Deduct from stock
      product.stockQuantity -= item.quantity;
      await product.save({ session });
      console.log(`createOrder: Updated stock for ${product.name}: ${product.stockQuantity}`);

      // Create product snapshot
      productSnapshots.push({
        productId: product._id,
        name: product.name,
        description: product.description,
        photo: product.images && product.images.length > 0 ? product.images[0] : '',
        quantity: item.quantity,
        price: itemPrice - bulkDiscount,
        bulkDiscounts: product.bulkDiscounts
      });
    }

    // Update voucher usage count
    if (vouchersUsed && vouchersUsed.length > 0) {
      console.log('createOrder: Updating voucher usage counts.');
      for (const voucherId of vouchersUsed) {
        await Voucher.findByIdAndUpdate(
          voucherId,
          { $inc: { usedCount: 1 } },
          { session }
        );
      }
    }

    // Calculate coins (1 coin per rupee, ignore fractions)
    const coinsGenerated = Math.floor(subtotal);
    console.log(`createOrder: Coins generated: ${coinsGenerated}`);

    // Create order
    const orderData = {
      customerId,
      customName: customName || customer.name || '',
      address,
      paymentMethod,
      products: productSnapshots,
      deliveryInstructions: deliveryInstructions || '',
      vouchersUsed: vouchersUsed || [],
      coinsGenerated,
      subtotal,
      discountApplied,
      totalPaid: subtotal,
      statusHistory: [{ status: 'pending', timestamp: new Date() }]
    };

    console.log('createOrder: Creating order with data:', JSON.stringify(orderData, null, 2));
    const order = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    console.log('createOrder: Order created successfully:', order[0]._id);
    return res.status(201).json(order[0]);
  } catch (err) {
    console.error('createOrder: Aborting transaction due to error:', err);
    await session.abortTransaction();
    session.endSession();
    console.error('createOrder error', err);
    return res.status(400).json({ message: err.message });
  }
};

exports.listOrders = async (req, res) => {
  try {
    // Get customerId from JWT token
    if (!req.user || !req.user.customerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const docs = await Order.find({ customerId: req.user.customerId })
      .lean();
    
    return res.json(docs);
  } catch (err) {
    console.error('listOrders error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    // Get customerId from JWT token
    if (!req.user || !req.user.customerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const doc = await Order.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });

    // Verify the customer owns this order
    if (doc.customerId.toString() !== req.user.customerId.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this order' });
    }

    return res.json(doc);
  } catch (err) {
    console.error('getOrder error', err);
    return res.status(400).json({ message: 'Invalid id' });
  }
};

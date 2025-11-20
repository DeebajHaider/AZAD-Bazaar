const Order = require('../models/Order');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, customName, address, paymentMethod, products, deliveryInstructions, vouchersUsed } = req.body;

    // Validate required fields
    if (!customerId || !address || !paymentMethod || !products || products.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Validate vouchers if any
    if (vouchersUsed && vouchersUsed.length > 0) {
      for (const voucherId of vouchersUsed) {
        const voucher = await Voucher.findById(voucherId).session(session);
        if (!voucher) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: 'Invalid voucher' });
        }
        if (!voucher.isActive) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher is not active' });
        }
        const now = new Date();
        if (now < voucher.startDate || now > voucher.endDate) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher expired' });
        }
        if (voucher.usedCount >= voucher.usageLimit) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher usage limit reached' });
        }
        if (voucher.mustBeUsedBy && voucher.mustBeUsedBy.toString() !== customerId.toString()) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: 'Voucher not valid for this customer' });
        }
      }
    }

    // Verify stock and lock products
    const productSnapshots = [];
    let subtotal = 0;
    let discountApplied = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      const availableStock = product.stockQuantity - (product.reservedQuantity || 0);
      if (availableStock < item.quantity) {
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

      // Deduct from stock
      product.stockQuantity -= item.quantity;
      await product.save({ session });

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

    const order = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(order[0]);
  } catch (err) {
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
      .select('_id')
      .lean();
    
    const orderIds = docs.map(doc => doc._id);
    return res.json(orderIds);
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

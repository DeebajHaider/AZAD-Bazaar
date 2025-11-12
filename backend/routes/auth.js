const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Customer = require('../models/Customer');
const Otp = require('../models/Otp');
const { generateOtp } = require('../utils/otp');
const { sendOtp } = require('../utils/sendOtp');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone, isNewUser } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (isNewUser) {
      const existing = await Customer.findOne({ phone });
      if (existing) return res.status(400).json({ message: 'Customer already exists' });
      await Otp.create({ phone, code, expiresAt, isNewUser: true });
    } else {
      const customer = await Customer.findOne({ phone });
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      await Otp.create({ phone, code, expiresAt, customerId: customer._id });
    }

    await sendOtp(phone, code);
    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('request-otp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP and login/create user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code, name, address, lat, lng } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone and code are required' });

    const otpDoc = await Otp.findOne({ phone, code, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).populate('customerId');
    if (!otpDoc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    otpDoc.used = true;
    await otpDoc.save();

    let user = await User.findOne({ phone });

    // If the OTP was issued for a new user, create a Customer document using provided profile data
    if (otpDoc.isNewUser) {
      // If a customer already exists for this phone (race) use it, otherwise create
      let customer = await Customer.findOne({ phone });
      if (!customer) {
        const payload = { phone };
        if (name) payload.name = name;
        // Convert incoming single address + lat/lng into addresses array (single object)
        if (address) {
          payload.addresses = [{
            addressId: new mongoose.Types.ObjectId().toString(),
            label: 'Home',
            addressText: address,
            lat: typeof lat !== 'undefined' ? lat : null,
            lng: typeof lng !== 'undefined' ? lng : null,
            isDefault: true
          }];
        }
        try {
          customer = await Customer.create(payload);
        } catch (err) {
          // If creation fails due to duplicate or validation, try to find existing
          customer = await Customer.findOne({ phone });
        }
      }

      if (!user) {
        user = await User.create({ phone, customerId: customer ? customer._id : null });
      } else if (!user.customerId && customer) {
        user.customerId = customer._id;
        await user.save();
      }
    } else {
      // Existing-user flow: try to resolve customerId from OTP or customer collection
      let customerId = otpDoc.customerId ? otpDoc.customerId._id : null;
      if (!customerId) {
        const customer = await Customer.findOne({ phone });
        if (!customer) return res.status(400).json({ message: 'Customer not found for OTP' });
        customerId = customer._id;
      }

      if (!user) {
        user = await User.create({ phone, customerId });
      } else if (!user.customerId && customerId) {
        user.customerId = customerId;
        await user.save();
      }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });

    const token = jwt.sign({ userId: user._id, phone: user.phone }, secret, { expiresIn: '90d' });

    return res.json({ success: true, token, user: { id: user._id, phone: user.phone, customerId: user.customerId || null } });
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected test route
router.get('/me', authMiddleware, async (req, res) => {
  const user = req.user;
  return res.json({ user: { id: user._id, phone: user.phone, createdAt: user.createdAt, customerId: user.customerId || null } });
});

module.exports = router;

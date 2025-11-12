const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // DEBUG: log incoming authorization header for troubleshooting
    if (process.env.DEBUG_AUTH === 'true') {
      console.debug('AuthMiddleware incoming authorization header:', authHeader);
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: missing token' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });

    const payload = jwt.verify(token, secret);
    if (!payload || !payload.userId) return res.status(401).json({ message: 'Invalid token' });

    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;

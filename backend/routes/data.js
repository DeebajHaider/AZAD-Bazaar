const express = require('express');
const router = express.Router();

const productCtrl = require('../controllers/productController');
const brandCtrl = require('../controllers/brandController');
const categoryCtrl = require('../controllers/categoryController');
const voucherCtrl = require('../controllers/voucherController');
const orderCtrl = require('../controllers/orderController');
const customerCtrl = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// Products
router.post('/products', productCtrl.createProduct);
router.get('/products', productCtrl.listProducts);
router.get('/products/:id', productCtrl.getProduct);
router.get('/products/:id/related', productCtrl.getRelatedProducts);

// Brands
router.post('/brands', brandCtrl.createBrand);
router.get('/brands', brandCtrl.listBrands);
router.get('/brands/:id', brandCtrl.getBrand);

// Categories
router.post('/categories', categoryCtrl.createCategory);
router.get('/categories', categoryCtrl.listCategories);
router.get('/categories/:id', categoryCtrl.getCategory);

// Vouchers
router.post('/vouchers', voucherCtrl.createVoucher);
router.get('/vouchers', voucherCtrl.listVouchers);
router.get('/vouchers/:id', voucherCtrl.getVoucher);
router.post('/vouchers/validate', voucherCtrl.validateVoucher);

// Orders (authenticated)
router.post('/orders', authMiddleware, orderCtrl.createOrder);
router.get('/orders', authMiddleware, orderCtrl.listOrders);
router.get('/orders/:id', authMiddleware, orderCtrl.getOrder);

// Customers (basic)
router.post('/customers', customerCtrl.createCustomer);
router.get('/customers', customerCtrl.listCustomers);
router.get('/customers/:id', customerCtrl.getCustomer);
router.put('/customers/:id', customerCtrl.updateCustomer);

// Cart endpoints (authenticated)
router.get('/cart', authMiddleware, customerCtrl.getCart);
router.post('/cart/add', authMiddleware, customerCtrl.addProductToCart);
router.post('/cart/decrement', authMiddleware, customerCtrl.decrementProductInCart);
router.post('/cart/clear', authMiddleware, customerCtrl.clearCart);
router.post('/cart/remove', authMiddleware, customerCtrl.removeProductFromCart);

// Favorites (authenticated)
router.get('/favorites', authMiddleware, customerCtrl.getFavorites);
router.post('/favorites/add', authMiddleware, customerCtrl.addFavorite);
router.post('/favorites/remove', authMiddleware, customerCtrl.removeFavorite);

// Address management routes
router.get('/addresses', authMiddleware, customerCtrl.getAddresses);
router.post('/addresses', authMiddleware, customerCtrl.addAddress);
router.put('/addresses', authMiddleware, customerCtrl.updateAddress);
router.delete('/addresses', authMiddleware, customerCtrl.deleteAddress);

// Mobile Wallet management routes (authenticated)
router.get('/mobile-wallets', authMiddleware, customerCtrl.getMobileWallets);
router.post('/mobile-wallets', authMiddleware, customerCtrl.addMobileWallet);
router.put('/mobile-wallets', authMiddleware, customerCtrl.updateMobileWallet);
router.delete('/mobile-wallets', authMiddleware, customerCtrl.deleteMobileWallet);

// Credit Card management routes (authenticated)
router.get('/credit-cards', authMiddleware, customerCtrl.getCreditCards);
router.post('/credit-cards', authMiddleware, customerCtrl.addCreditCard);
router.delete('/credit-cards', authMiddleware, customerCtrl.deleteCreditCard);

module.exports = router;

const express = require('express');
const router = express.Router();

const productCtrl = require('../controllers/productController');
const brandCtrl = require('../controllers/brandController');
const categoryCtrl = require('../controllers/categoryController');
const voucherCtrl = require('../controllers/voucherController');
const orderCtrl = require('../controllers/orderController');
const customerCtrl = require('../controllers/customerController');

// Products
router.post('/products', productCtrl.createProduct);
router.get('/products', productCtrl.listProducts);
router.get('/products/:id', productCtrl.getProduct);

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

// Orders
router.post('/orders', orderCtrl.createOrder);
router.get('/orders', orderCtrl.listOrders);
router.get('/orders/:id', orderCtrl.getOrder);

// Customers (basic)
router.post('/customers', customerCtrl.createCustomer);
router.get('/customers', customerCtrl.listCustomers);
router.get('/customers/:id', customerCtrl.getCustomer);

module.exports = router;

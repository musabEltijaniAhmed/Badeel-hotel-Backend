'use strict';

const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethod.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

// Validation middleware
const validatePaymentMethod = [
  body('provider_name').notEmpty().withMessage('Provider name is required'),
  body('provider_code')
    .notEmpty().withMessage('Provider code is required')
    .isUppercase().withMessage('Provider code must be uppercase'),
  body('image_url')
    .optional()
    .isURL().withMessage('Image URL must be a valid URL'),
  body('status')
    .optional()
    .isIn(['active', 'blocked']).withMessage('Status must be either active or blocked'),
  body('display_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('callback_url')
    .optional()
    .isURL().withMessage('Callback URL must be a valid URL'),
];

// Admin routes
router.get(
  '/admin/payment-methods',
  authenticate(),
  checkPermission('payment_methods_view'),
  paymentMethodController.listPaymentMethods
);

router.post(
  '/admin/payment-methods',
  authenticate(),
  checkPermission('payment_methods_create'),
  validate(validatePaymentMethod),
  paymentMethodController.createPaymentMethod
);

router.put(
  '/admin/payment-methods/:id',
  authenticate(),
  checkPermission('payment_methods_edit'),
  validate(validatePaymentMethod),
  paymentMethodController.updatePaymentMethod
);

router.delete(
  '/admin/payment-methods/:id',
  authenticate(),
  checkPermission('payment_methods_delete'),
  paymentMethodController.deletePaymentMethod
);

router.patch(
  '/admin/payment-methods/:id/toggle-status',
  authenticate(),
  checkPermission('payment_methods_edit'),
  paymentMethodController.togglePaymentMethodStatus
);

// Client routes
router.get(
  '/payment-methods',
  authenticate(),
  paymentMethodController.listActivePaymentMethods
);

module.exports = router;

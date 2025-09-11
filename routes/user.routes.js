const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission, checkRole } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const userCtrl = require('../controllers/user.controller');

// List rooms - عام للجميع (النظام القديم)
router.get('/rooms', userCtrl.listRooms);

// List properties - عام للجميع (النظام الجديد)
router.get('/properties', userCtrl.listProperties || userCtrl.listRooms);

// Create booking - العملاء فقط
router.post(
  '/booking',
  authenticate(),
  checkPermission('bookings', 'create'),
  validate([
    body('roomId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('paymentMethodId').notEmpty(),
    body('couponCode').optional().isString().isLength({ min: 3, max: 20 }),
  ]),
  userCtrl.createBooking
);

// Get booking by id - العملاء فقط (حجوزاتهم)
router.get('/booking/:id', 
  authenticate(), 
  checkPermission('bookings', 'view'), 
  userCtrl.getBooking
);

// Add review - العملاء فقط
router.post(
  '/review',
  authenticate(),
  checkPermission('reviews', 'create'),
  validate([
    body('bookingId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
  ]),
  userCtrl.createReview
);

// Notifications - المستخدمين المسجلين
router.get('/notifications', 
  authenticate(), 
  userCtrl.getNotifications
);

// Validate coupon - العملاء فقط
router.post(
  '/validate-coupon',
  authenticate(),
  checkPermission('coupons', 'use'),
  validate([
    body('couponCode').notEmpty().isString(),
    body('orderAmount').isFloat({ min: 0.01 }),
  ]),
  userCtrl.validateCoupon
);

// Create property booking with deposit - العملاء فقط (النظام الجديد)
router.post(
  '/property-booking',
  authenticate(),
  checkPermission('bookings', 'create'),
  validate([
    body('property_id').isInt(),
    body('check_in').isISO8601(),
    body('check_out').isISO8601(),
    body('guest_count').isInt({ min: 1 }),
    body('payment_method').isIn(['mada', 'visa', 'mastercard', 'apple_pay', 'stc_pay']),
    body('special_requests').optional().isLength({ max: 500 }),
    body('couponCode').optional().isString().isLength({ min: 3, max: 20 }),
  ]),
  userCtrl.createPropertyBooking
);

module.exports = router; 
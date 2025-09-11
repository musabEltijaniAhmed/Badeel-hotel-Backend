const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission, requireAdmin, requireStaff } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const adminCtrl = require('../controllers/admin.controller');
const authz = require('../middlewares/authorize.middleware');
const logAction = require('../middlewares/activityLog.middleware');

router.use(authenticate());
router.use(requireStaff); // التأكد من أن المستخدم admin أو staff

// Rooms CRUD
router.post(
  '/rooms',
  checkPermission('rooms', 'create'),
  upload.single('photo'),
  validate([body('name').notEmpty(), body('price').isNumeric()]),
  adminCtrl.createRoom
);
router.get('/rooms', checkPermission('rooms', 'view'), adminCtrl.listRooms);
router.patch('/rooms/:id', 
  checkPermission('rooms', 'edit'),
  upload.single('photo'), 
  adminCtrl.updateRoom
);
router.delete('/rooms/:id', 
  checkPermission('rooms', 'delete'),
  adminCtrl.deleteRoom
);

// Users CRUD - المديرين فقط
router.get('/users', checkPermission('users', 'view'), adminCtrl.listUsers);
router.patch('/users/:id', checkPermission('users', 'edit'), adminCtrl.updateUser);
router.delete('/users/:id', checkPermission('users', 'delete'), adminCtrl.deleteUser);

// Bookings - Staff يمكنهم عرض وتعديل
router.get('/bookings', checkPermission('bookings', 'view_all'), adminCtrl.listBookings);
router.get('/reports/bookings-csv', 
  checkPermission('reports', 'export'),
  adminCtrl.exportBookingsCSV
);

// Reviews - Staff يمكنهم الإشراف
router.get('/reviews', checkPermission('reviews', 'view'), adminCtrl.listReviews);
router.delete('/reviews/:id', 
  checkPermission('reviews', 'moderate'),
  adminCtrl.deleteReview
);

// Coupons CRUD - إدارة الكوبونات
const couponCtrl = require('../controllers/coupon.controller');

router.get('/coupons', checkPermission('coupons', 'view'), couponCtrl.listCoupons);
router.post('/coupons', 
  checkPermission('coupons', 'create'),
  validate([
    body('code').notEmpty().isLength({ min: 3, max: 20 }),
    body('type').isIn(['percentage', 'fixed_amount']),
    body('value').isFloat({ min: 0 }),
    body('start_date').isISO8601(),
    body('end_date').isISO8601(),
    body('min_order_amount').isFloat({ min: 0 }),
    body('usage_limit').optional().isInt({ min: 1 }),
  ]),
  couponCtrl.createCoupon
);
router.patch('/coupons/:id', 
  checkPermission('coupons', 'edit'),
  couponCtrl.updateCoupon
);
router.delete('/coupons/:id', 
  checkPermission('coupons', 'delete'),
  couponCtrl.deleteCoupon
);

module.exports = router; 
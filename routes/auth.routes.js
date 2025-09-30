const router = require('express').Router();
const { body, header } = require('express-validator');
const saudiPhone = require('../middlewares/saudiPhone.middleware');
const validate = require('../middlewares/validate.middleware');

const { 
  register, 
  registerCustomer,
  registerStaff,
  registerAdmin,
  login, 
  forgotPassword, 
  resetPassword, 
  logout
} = require('../controllers/auth.controller');

// ===== تسجيل العملاء (عام) =====
router.post('/register', saudiPhone(),
  validate([
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('email').optional(),
    body('password').isLength({ min: 6 }),
  ]),
  registerCustomer // سيتم توجيههم للعملاء افتراضياً
);

// تسجيل العملاء (واضح)
router.post('/register/customer', saudiPhone(),
  validate([
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('email').optional(),
    body('password').isLength({ min: 6 }),
  ]),
  registerCustomer
);

// ===== تسجيل الموظفين (مباشر) =====
router.post('/register/staff', saudiPhone(),
  validate([
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),

  ]),
  registerStaff
);

// ===== تسجيل المديرين (مباشر) =====
router.post('/register/admin', saudiPhone(),
  validate([
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }), // كلمة مرور أقوى للمديرين
   // body('invitationCode').notEmpty().withMessage('كود الدعوة مطلوب للمديرين'),
  ]),
  registerAdmin
);
router.post('/login', saudiPhone(),
  validate([
        body('phone').notEmpty(),
    body('password').notEmpty(),
  ]),
  login
);
router.post('/forgot-password', saudiPhone(),
  validate([
        body('phone').notEmpty(),
  ]),
  forgotPassword
);
router.post('/reset-password', saudiPhone(),
  validate([
    body('phone').notEmpty(),
    body('otp').isLength({ min: 6, max: 6 }),
    body('newPassword').isLength({ min: 6 }),
    body('confirmPassword').isLength({ min: 6 }),
  ]),
  resetPassword
);
 
// ===== تسجيل الدخول والخروج =====
router.post('/logout', 
  validate([
    header('Authorization').notEmpty(),
  ]),
  logout
);



module.exports = router; 
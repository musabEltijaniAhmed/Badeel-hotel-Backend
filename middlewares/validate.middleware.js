const { validationResult, body, param, query } = require('express-validator');

module.exports = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
            return res.fail('Validation error', errors.array(), 422);
    }
    next();
  };
};

// دوال التحقق من صحة بيانات التقييم
module.exports.validateReview = [
  body('bookingId')
    .notEmpty()
    .withMessage('معرف الحجز مطلوب')
    .isUUID()
    .withMessage('معرف الحجز غير صحيح'),
  
  body('rating')
    .notEmpty()
    .withMessage('التقييم مطلوب')
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون من 1 إلى 5'),
  
  body('comment')
    .optional()
    .isString()
    .withMessage('التعليق يجب أن يكون نص')
    .isLength({ max: 1000 })
    .withMessage('التعليق يجب أن لا يتجاوز 1000 حرف'),
  
  body('media')
    .optional()
    .isArray()
    .withMessage('الوسائط يجب أن تكون مصفوفة')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(item => 
          typeof item === 'string' && 
          (item.startsWith('http://') || item.startsWith('https://'))
        );
      }
      return true;
    })
    .withMessage('روابط الوسائط غير صحيحة')
];

module.exports.validateReviewUpdate = [
  param('reviewId')
    .notEmpty()
    .withMessage('معرف التقييم مطلوب')
    .isUUID()
    .withMessage('معرف التقييم غير صحيح'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون من 1 إلى 5'),
  
  body('comment')
    .optional()
    .isString()
    .withMessage('التعليق يجب أن يكون نص')
    .isLength({ max: 1000 })
    .withMessage('التعليق يجب أن لا يتجاوز 1000 حرف'),
  
  body('media')
    .optional()
    .isArray()
    .withMessage('الوسائط يجب أن تكون مصفوفة')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every(item => 
          typeof item === 'string' && 
          (item.startsWith('http://') || item.startsWith('https://'))
        );
      }
      return true;
    })
    .withMessage('روابط الوسائط غير صحيحة')
];

module.exports.validateReviewParams = [
  param('reviewId')
    .notEmpty()
    .withMessage('معرف التقييم مطلوب')
    .isUUID()
    .withMessage('معرف التقييم غير صحيح')
];

module.exports.validatePropertyId = [
  param('propertyId')
    .notEmpty()
    .withMessage('معرف العقار مطلوب')
    .isInt({ min: 1 })
    .withMessage('معرف العقار غير صحيح')
];

module.exports.validateBookingId = [
  param('bookingId')
    .notEmpty()
    .withMessage('معرف الحجز مطلوب')
    .isUUID()
    .withMessage('معرف الحجز غير صحيح')
];

// التحقق من صحة بيانات الصفحة الثابتة
module.exports.validateStaticPage = [
  body('title_ar')
    .notEmpty()
    .withMessage('العنوان بالعربية مطلوب')
    .isLength({ max: 255 })
    .withMessage('العنوان بالعربية يجب أن لا يتجاوز 255 حرف'),

  body('title_en')
    .notEmpty()
    .withMessage('العنوان بالإنجليزية مطلوب')
    .isLength({ max: 255 })
    .withMessage('العنوان بالإنجليزية يجب أن لا يتجاوز 255 حرف'),

  body('content_ar')
    .notEmpty()
    .withMessage('المحتوى بالعربية مطلوب')
    .custom((value) => {
      // التحقق من صحة HTML
      if (value.includes('<script>')) {
        throw new Error('HTML غير آمن');
      }
      return true;
    }),

  body('content_en')
    .notEmpty()
    .withMessage('المحتوى بالإنجليزية مطلوب')
    .custom((value) => {
      // التحقق من صحة HTML
      if (value.includes('<script>')) {
        throw new Error('HTML غير آمن');
      }
      return true;
    }),

  body('slug')
    .notEmpty()
    .withMessage('المعرف مطلوب')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('المعرف يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط')
    .isLength({ max: 100 })
    .withMessage('المعرف يجب أن لا يتجاوز 100 حرف')
];

module.exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('عدد العناصر يجب أن يكون من 1 إلى 100'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('التقييم يجب أن يكون من 1 إلى 5')
]; 
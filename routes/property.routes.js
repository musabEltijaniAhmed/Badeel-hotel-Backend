const router = require('express').Router();
const { body, query, param } = require('express-validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission, requireAdmin, requireStaff } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

const propertyCtrl = require('../controllers/property.controller');
const propertyTypeCtrl = require('../controllers/propertyType.controller');

// ===== Property Types Management =====

// عرض جميع أنواع العقارات (عام)
router.get('/types', propertyTypeCtrl.listPropertyTypes);

// عرض تفاصيل نوع عقار (عام)
router.get('/types/:id', 
  validate([param('id').isInt()]),
  propertyTypeCtrl.getPropertyType
);

// إنشاء نوع عقار جديد (مديرين فقط)
router.post('/types',
  authenticate(),
  requireAdmin,
  checkPermission('properties', 'create'),
  validate([
    body('name_en').notEmpty().isLength({ min: 2, max: 50 }),
    body('name_ar').notEmpty().isLength({ min: 2, max: 50 }),
    body('description_en').optional().isLength({ max: 500 }),
    body('description_ar').optional().isLength({ max: 500 }),
    body('icon').optional().isLength({ max: 50 })
  ]),
  propertyTypeCtrl.createPropertyType
);

// تحديث نوع عقار (مديرين فقط)
router.patch('/types/:id',
  authenticate(),
  requireAdmin,
  checkPermission('properties', 'edit'),
  validate([param('id').isInt()]),
  propertyTypeCtrl.updatePropertyType
);

// حذف نوع عقار (مديرين فقط)
router.delete('/types/:id',
  authenticate(),
  requireAdmin,
  checkPermission('properties', 'delete'),
  validate([param('id').isInt()]),
  propertyTypeCtrl.deletePropertyType
);

// إضافة أنواع العقارات الافتراضية (مديرين فقط)
router.post('/types/seed',
  authenticate(),
  requireAdmin,
  checkPermission('properties', 'create'),
  propertyTypeCtrl.seedPropertyTypes
);

// ===== Properties Management =====

// عرض جميع العقارات مع فلترة (عام)
router.get('/',
  validate([
    query('type_id').optional().isInt(),
    query('location').optional().isString(),
    query('min_price').optional().isFloat({ min: 0 }),
    query('max_price').optional().isFloat({ min: 0 }),
    query('capacity').optional().isInt({ min: 1 }),
    query('featured').optional().isBoolean(),
    query('available_only').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort_by').optional().isIn(['createdAt', 'full_price', 'rating', 'name']),
    query('sort_order').optional().isIn(['ASC', 'DESC'])
  ]),
  propertyCtrl.listProperties
);

// عرض تفاصيل عقار محدد (عام)
router.get('/:id',
  validate([param('id').isInt()]),
  propertyCtrl.getPropertyDetails
);

// إنشاء عقار جديد (عام)
router.post('/',
  authenticate(),
  requireStaff,
  checkPermission('properties', 'create'),
  upload.array('media', 10), // حتى 10 ملفات
  validate([
    body('name').notEmpty().isLength({ min: 2, max: 100 }),
    body('description').optional().isLength({ max: 2000 }),
    body('type_id').isInt(),
    body('location').notEmpty().isLength({ min: 2, max: 100 }),
    body('address').optional().isLength({ max: 500 }),
    body('latitude').optional().isDecimal(),
    body('longitude').optional().isDecimal(),
    body('full_price').isFloat({ min: 0.01 }),
    body('deposit_type').isIn(['percentage', 'fixed_amount']),
    body('deposit_value').isFloat({ min: 0 }),
    body('capacity').isInt({ min: 1 }),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('amenities').optional().isJSON(),
    body('check_in_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('check_out_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
  ]),
  propertyCtrl.createProperty
);

// تحديث عقار (موظفين ومديرين)
router.patch('/:id',
  authenticate(),
  requireStaff,
  checkPermission('properties', 'edit'),
  validate([param('id').isInt()]),
  propertyCtrl.updateProperty
);

// حذف عقار (مديرين فقط)
router.delete('/:id',
  authenticate(),
  requireAdmin,
  checkPermission('properties', 'delete'),
  validate([param('id').isInt()]),
  propertyCtrl.deleteProperty
);

// إضافة وسائط لعقار موجود (موظفين ومديرين)
router.post('/:id/media',
  authenticate(),
  requireStaff,
  checkPermission('properties', 'edit'),
  upload.array('media', 5),
  validate([
    param('id').isInt(),
    body('alt_text').optional().isLength({ max: 200 }),
    body('title').optional().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('is_primary').optional().isBoolean()
  ]),
  propertyCtrl.addPropertyMedia
);

// عرض إحصائيات العقارات (موظفين ومديرين)
router.get('/admin/stats',
  authenticate(),
  requireStaff,
  checkPermission('properties', 'view'),
  propertyCtrl.getPropertyStats
);

module.exports = router;

const express = require('express');
const router = express.Router();
const staticPageController = require('../controllers/staticPage.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const authorizeMiddleware = require('../middlewares/authorize.middleware');

// مسارات المستخدمين (عامة)
router.get('/:slug', staticPageController.getPage);

// مسارات المسؤولين (تتطلب مصادقة وتفويض)
router.use(authenticate()); // التحقق من المصادقة
router.use(authorizeMiddleware(['admin', 'super_admin'])); // التحقق من الصلاحيات

router.get('/admin/all', staticPageController.getAllPages);
router.get('/admin/:slug', staticPageController.getPageBySlug);
router.put('/admin/:id', staticPageController.updatePage);

module.exports = router;

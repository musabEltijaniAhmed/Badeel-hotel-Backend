const express = require('express');
const router = express.Router();
const staticPageController = require('../controllers/staticPage.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/permission.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

// مسارات المسؤولين (تتطلب مصادقة وتفويض)
router.use('/admin', authenticate()); // التحقق من المصادقة
router.use('/admin', requireAdmin); // التحقق من الصلاحيات

router.get('/admin/pages', staticPageController.getAllPages); // List all pages
router.get('/admin/pages/:slug', staticPageController.getPageBySlug); // Get page by slug
router.post('/admin/pages', validateMiddleware.validateStaticPage, staticPageController.createPage); // Create new page
router.put('/admin/pages/:id', validateMiddleware.validateStaticPage, staticPageController.updatePage); // Update page
router.delete('/admin/pages/:id', staticPageController.deletePage); // Delete page

// مسارات المستخدمين (عامة)
router.get('/:slug', staticPageController.getPage);

module.exports = router;

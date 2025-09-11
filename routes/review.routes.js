const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');

// Middleware للمصادقة
router.use(authMiddleware);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: إنشاء تقييم جديد
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: معرف الحجز
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: التقييم من 1 إلى 5 نجوم
 *               comment:
 *                 type: string
 *                 description: نص التعليق (اختياري)
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: روابط الصور والفيديو (اختياري)
 *     responses:
 *       201:
 *         description: تم إنشاء التقييم بنجاح
 *       400:
 *         description: بيانات غير صحيحة
 *       403:
 *         description: غير مصرح
 *       404:
 *         description: الحجز غير موجود
 */
router.post('/', 
  validateMiddleware.validateReview,
  ReviewController.createReview
);

/**
 * @swagger
 * /api/reviews/property/{propertyId}:
 *   get:
 *     summary: الحصول على تقييمات العقار
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: معرف العقار
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: تصفية حسب التقييم
 *     responses:
 *       200:
 *         description: تم جلب التقييمات بنجاح
 */
router.get('/property/:propertyId', ReviewController.getPropertyReviews);

/**
 * @swagger
 * /api/reviews/user:
 *   get:
 *     summary: الحصول على تقييمات المستخدم
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *     responses:
 *       200:
 *         description: تم جلب التقييمات بنجاح
 */
router.get('/user', ReviewController.getUserReviews);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: تحديث التقييم
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التقييم
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: التقييم من 1 إلى 5 نجوم
 *               comment:
 *                 type: string
 *                 description: نص التعليق
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: روابط الصور والفيديو
 *     responses:
 *       200:
 *         description: تم تحديث التقييم بنجاح
 *       403:
 *         description: غير مصرح
 *       404:
 *         description: التقييم غير موجود
 */
router.put('/:reviewId', 
  validateMiddleware.validateReviewUpdate,
  ReviewController.updateReview
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: حذف التقييم
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف التقييم
 *     responses:
 *       200:
 *         description: تم حذف التقييم بنجاح
 *       403:
 *         description: غير مصرح
 *       404:
 *         description: التقييم غير موجود
 */
router.delete('/:reviewId', ReviewController.deleteReview);

/**
 * @swagger
 * /api/reviews/stats/{propertyId}:
 *   get:
 *     summary: الحصول على إحصائيات التقييم
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: معرف العقار
 *     responses:
 *       200:
 *         description: تم جلب الإحصائيات بنجاح
 */
router.get('/stats/:propertyId', ReviewController.getReviewStats);

/**
 * @swagger
 * /api/reviews/invitation/{bookingId}:
 *   post:
 *     summary: إرسال دعوة تقييم
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: معرف الحجز
 *     responses:
 *       200:
 *         description: تم إرسال دعوة التقييم بنجاح
 *       403:
 *         description: غير مصرح
 *       404:
 *         description: الحجز غير موجود
 */
router.post('/invitation/:bookingId', ReviewController.sendReviewInvitation);

module.exports = router;

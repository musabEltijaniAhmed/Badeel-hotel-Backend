const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

// All dashboard routes require authentication and admin role
router.use(authenticate());
router.use(requireAdmin);

// Get dashboard statistics
router.get('/stats',
  validate([
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Period must be daily, weekly, or monthly'),
    query('compare_previous')
      .optional()
      .isBoolean()
      .withMessage('compare_previous must be a boolean')
  ]),
  dashboardController.getDashboardStats
);

module.exports = router;

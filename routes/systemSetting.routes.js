'use strict';

const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSetting.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');

// Validation middleware
const validateSettings = [
  body('settings').isArray().withMessage('Settings must be an array'),
  body('settings.*.key').notEmpty().withMessage('Setting key is required'),
  body('settings.*.value').optional(),
  body('settings.*.is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];

const validateGroup = [
  param('group').isIn(['sms', 'firebase', 'email', 'general']).withMessage('Invalid setting group')
];

const validateCreateSetting = [
  body('key')
    .notEmpty().withMessage('Setting key is required')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Key must contain only letters, numbers and underscores'),
  body('value').notEmpty().withMessage('Setting value is required'),
  body('group').isIn(['sms', 'firebase', 'email', 'general']).withMessage('Invalid setting group'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('is_encrypted').optional().isBoolean().withMessage('is_encrypted must be a boolean')
];

// Admin routes
router.get(
  '/admin/settings',
  authenticate(),
  checkPermission('system', 'manage'),
  systemSettingController.getAllSettings
);

router.get(
  '/admin/settings/:group',
  authenticate(),
  checkPermission('system', 'manage'),
  validate(validateGroup),
  systemSettingController.getSettingsByGroup
);

router.put(
  '/admin/settings',
  authenticate(),
  checkPermission('system', 'manage'),
  validate(validateSettings),
  systemSettingController.updateSettings
);

router.post(
  '/admin/settings',
  authenticate(),
  checkPermission('system', 'manage'),
  validate(validateCreateSetting),
  systemSettingController.createSetting
);

router.patch(
  '/admin/settings/:key/toggle',
  authenticate(),
  checkPermission('system', 'manage'),
  systemSettingController.toggleSetting
);

module.exports = router;

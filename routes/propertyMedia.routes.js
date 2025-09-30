const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const propertyMediaController = require('../controllers/propertyMedia.controller');
const upload = require('../middlewares/upload.middleware');

// Get all media for a property
router.get(
  '/properties/:propertyId/media',
  propertyMediaController.getPropertyMedia
);

// Get specific media item
router.get(
  '/properties/:propertyId/media/:mediaId',
  propertyMediaController.getMediaById
);

// Serve media files
router.get(
  '/media/:filename',
  propertyMediaController.serveMedia
);

module.exports = router;

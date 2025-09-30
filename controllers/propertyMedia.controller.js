const { PropertyMedia, Property } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * Get all media for a specific property
 */
exports.getPropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.fail('Property not found', null, 404);
    }

    // Get all media for the property
    const media = await PropertyMedia.findAll({
      where: {
        property_id: propertyId,
        is_active: true
      },
      order: [
        ['is_primary', 'DESC'],
        ['display_order', 'ASC'],
        ['createdAt', 'DESC']
      ],
      attributes: [
        'id',
        'media_type',
        'url',
        'alt_text',
        'title',
        'description',
        'display_order',
        'is_primary',
        'file_size',
        'file_format',
        'width',
        'height',
        'duration',
        'createdAt'
      ]
    });

    // Transform URLs to full URLs if they're relative paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const transformedMedia = media.map(item => {
      const mediaItem = item.toJSON();
      if (!mediaItem.url.startsWith('http')) {
        mediaItem.url = `${baseUrl}/${mediaItem.url.replace(/^uploads\//, '')}`;
      }
      return mediaItem;
    });

    return res.success({
      property_id: propertyId,
      total_media: transformedMedia.length,
      media: transformedMedia
    });

  } catch (error) {
    console.error('Error fetching property media:', error);
    return res.fail('Failed to fetch property media');
  }
};

/**
 * Get a specific media item
 */
exports.getMediaById = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;

    const media = await PropertyMedia.findOne({
      where: {
        id: mediaId,
        property_id: propertyId,
        is_active: true
      }
    });

    if (!media) {
      return res.fail('Media not found', null, 404);
    }

    // Transform URL to full URL if it's a relative path
    const mediaJson = media.toJSON();
    if (!mediaJson.url.startsWith('http')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      mediaJson.url = `${baseUrl}/${mediaJson.url.replace(/^uploads\//, '')}`;
    }

    return res.success({ media: mediaJson });

  } catch (error) {
    console.error('Error fetching media item:', error);
    return res.fail('Failed to fetch media item');
  }
};

/**
 * Serve media file
 */
exports.serveMedia = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found'
      });
    }

    // Get file extension
    const ext = path.extname(filename).toLowerCase();
    
    // Set content type based on file extension
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4'
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Stream the file
    const stream = fs.createReadStream(filepath);
    stream.pipe(res);

  } catch (error) {
    console.error('Error serving media file:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to serve media file'
    });
  }
};

const { Property, PropertyType, PropertyMedia, User, Booking } = require('../models');
const { Op } = require('sequelize');

/**
 * إنشاء عقار جديد مع رفع الوسائط
 */
exports.createProperty = async (req, res, next) => {
  try {
    const {
      name,
      description,
      type_id,
      location,
      address,
      latitude,
      longitude,
      full_price,
      deposit_type,
      deposit_value,
      capacity,
      bedrooms,
      bathrooms,
      amenities,
      check_in_time,
      check_out_time
    } = req.body;

    // التحقق من نوع العقار
    const propertyType = await PropertyType.findByPk(type_id);
    if (!propertyType) {
      return res.status(400).json({
        status: false,
        message: 'PROPERTY_TYPE_NOT_FOUND'
      });
    }

    // إنشاء العقار
    const property = await Property.create({
      name,
      description,
      type_id,
      location,
      address,
      latitude,
      longitude,
      full_price,
      deposit_type,
      deposit_value,
      capacity,
      bedrooms,
      bathrooms,
      amenities: amenities ? JSON.parse(amenities) : null,
      check_in_time,
      check_out_time,
      created_by: req.user.id
    });

    // إضافة الوسائط إذا كانت موجودة
    if (req.files && req.files.length > 0) {
      const mediaPromises = req.files.map((file, index) => {
        return PropertyMedia.create({
          property_id: property.id,
          media_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          url: file.path || file.filename,
          file_format: file.mimetype.split('/')[1],
          file_size: file.size,
          display_order: index + 1,
          is_primary: index === 0, // أول ملف يكون الرئيسي
          uploaded_by: req.user.id
        });
      });
      
      await Promise.all(mediaPromises);
    }

    // إرجاع العقار مع بياناته الكاملة
    const propertyWithDetails = await Property.findByPk(property.id, {
      include: [
        { 
          model: PropertyType, 
          as: 'PropertyType',
          attributes: ['id', 'name_ar', 'name_en', 'icon']
        },
        { 
          model: PropertyMedia, 
          as: 'Media',
          attributes: ['id', 'media_type', 'url', 'display_order', 'is_primary']
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(201).json({
      status: true,
      message: 'تم إنشاء العقار بنجاح',
      data: propertyWithDetails
    });

  } catch (error) {
    next(error);
  }
};

/**
 * عرض جميع العقارات مع فلترة
 */
exports.listProperties = async (req, res, next) => {
  try {
    const { 
      type_id, 
      location, 
      min_price, 
      max_price, 
      capacity,
      featured,
      available_only = true,
      page = 1, 
      limit = 10,
      sort_by = 'createdAt',
      sort_order = 'DESC'
    } = req.query;

    // بناء شروط البحث
    const whereConditions = {
      is_active: true
    };

    if (available_only === 'true') {
      whereConditions.is_available = true;
    }

    if (type_id) {
      whereConditions.type_id = type_id;
    }

    if (location) {
      whereConditions.location = {
        [Op.like]: `%${location}%`
      };
    }

    if (min_price || max_price) {
      whereConditions.full_price = {};
      if (min_price) whereConditions.full_price[Op.gte] = min_price;
      if (max_price) whereConditions.full_price[Op.lte] = max_price;
    }

    if (capacity) {
      whereConditions.capacity = {
        [Op.gte]: capacity
      };
    }

    if (featured === 'true') {
      whereConditions.featured = true;
    }

    // حساب التصفح
    const offset = (page - 1) * limit;

    const { rows: properties, count: total } = await Property.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: PropertyType, 
          as: 'PropertyType',
          attributes: ['id', 'name_ar', 'name_en', 'icon']
        },
        { 
          model: PropertyMedia, 
          as: 'Media',
          where: { is_primary: true },
          required: false,
          attributes: ['id', 'media_type', 'url', 'alt_text']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort_by, sort_order.toUpperCase()]],
      distinct: true
    });

    return res.json({
      status: true,
      data: {
        properties,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * عرض تفاصيل عقار محدد
 */
exports.getPropertyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({
      where: { id, is_active: true },
      include: [
        { 
          model: PropertyType, 
          as: 'PropertyType'
        },
        { 
          model: PropertyMedia, 
          as: 'Media',
          order: [['display_order', 'ASC']]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_NOT_FOUND'
      });
    }

    return res.json({
      status: true,
      data: property
    });

  } catch (error) {
    next(error);
  }
};

/**
 * تحديث عقار
 */
exports.updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_NOT_FOUND'
      });
    }

    // تحديث الأمنيات إذا كانت موجودة
    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }

    await property.update(updateData);

    // إرجاع العقار المحدث
    const updatedProperty = await Property.findByPk(id, {
      include: [
        { model: PropertyType, as: 'PropertyType' },
        { model: PropertyMedia, as: 'Media' }
      ]
    });

    return res.json({
      status: true,
      message: 'تم تحديث العقار بنجاح',
      data: updatedProperty
    });

  } catch (error) {
    next(error);
  }
};

/**
 * حذف عقار (منطقي)
 */
exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_NOT_FOUND'
      });
    }

    // التحقق من وجود حجوزات نشطة
    const activeBookings = await Booking.count({
      where: {
        property_id: id,
        status: ['confirmed', 'pending'],
        payment_status: ['paid', 'partial']
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: false,
        message: 'CANNOT_DELETE_PROPERTY_WITH_ACTIVE_BOOKINGS',
        data: { active_bookings: activeBookings }
      });
    }

    // حذف منطقي
    await property.update({ is_active: false });

    return res.json({
      status: true,
      message: 'تم حذف العقار بنجاح'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * إضافة وسائط للعقار
 */
exports.addPropertyMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { alt_text, title, description, is_primary = false } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_NOT_FOUND'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'NO_FILES_UPLOADED'
      });
    }

    // إذا كان المراد تعيين صورة رئيسية، إزالة الرئيسية الحالية
    if (is_primary) {
      await PropertyMedia.update(
        { is_primary: false },
        { where: { property_id: id, is_primary: true } }
      );
    }

    // الحصول على أعلى ترتيب حالي
    const maxOrder = await PropertyMedia.max('display_order', {
      where: { property_id: id }
    }) || 0;

    const mediaPromises = req.files.map((file, index) => {
      return PropertyMedia.create({
        property_id: id,
        media_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        url: file.path || file.filename,
        alt_text,
        title,
        description,
        file_format: file.mimetype.split('/')[1],
        file_size: file.size,
        display_order: maxOrder + index + 1,
        is_primary: is_primary && index === 0,
        uploaded_by: req.user.id
      });
    });
    
    const newMedia = await Promise.all(mediaPromises);

    return res.status(201).json({
      status: true,
      message: 'تم إضافة الوسائط بنجاح',
      data: newMedia
    });

  } catch (error) {
    next(error);
  }
};

/**
 * عرض الإحصائيات
 */
exports.getPropertyStats = async (req, res, next) => {
  try {
    const stats = await Property.findAll({
      attributes: [
        'type_id',
        [Property.sequelize.fn('COUNT', Property.sequelize.col('id')), 'count']
      ],
      include: [
        { 
          model: PropertyType, 
          as: 'PropertyType',
          attributes: ['name_ar', 'name_en']
        }
      ],
      where: { is_active: true },
      group: ['type_id', 'PropertyType.id'],
      raw: false
    });

    const totalProperties = await Property.count({
      where: { is_active: true }
    });

    const availableProperties = await Property.count({
      where: { is_active: true, is_available: true }
    });

    const featuredProperties = await Property.count({
      where: { is_active: true, featured: true }
    });

    return res.json({
      status: true,
      data: {
        total_properties: totalProperties,
        available_properties: availableProperties,
        featured_properties: featuredProperties,
        by_type: stats
      }
    });

  } catch (error) {
    next(error);
  }
};

const { PropertyType, Property } = require('../models');

/**
 * إنشاء نوع عقار جديد
 */
exports.createPropertyType = async (req, res, next) => {
  try {
    const { name_en, name_ar, description_en, description_ar, icon } = req.body;

    const propertyType = await PropertyType.create({
      name_en,
      name_ar,
      description_en,
      description_ar,
      icon
    });

    return res.status(201).json({
      status: true,
      message: 'تم إنشاء نوع العقار بنجاح',
      data: propertyType
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: false,
        message: 'PROPERTY_TYPE_NAME_EXISTS',
        errors: error.errors
      });
    }
    next(error);
  }
};

/**
 * عرض جميع أنواع العقارات
 */
exports.listPropertyTypes = async (req, res, next) => {
  try {
    const { include_inactive = false } = req.query;

    const whereConditions = {};
    if (include_inactive !== 'true') {
      whereConditions.is_active = true;
    }

    const propertyTypes = await PropertyType.findAll({
      where: whereConditions,
      include: [
        {
          model: Property,
          as: 'Properties',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }
      ],
      order: [['name_ar', 'ASC']]
    });

    // إضافة عدد العقارات لكل نوع
    const typesWithCount = propertyTypes.map(type => {
      const typeData = type.toJSON();
      typeData.properties_count = type.Properties ? type.Properties.length : 0;
      delete typeData.Properties; // إزالة التفاصيل وإبقاء العدد فقط
      return typeData;
    });

    return res.json({
      status: true,
      data: typesWithCount
    });

  } catch (error) {
    next(error);
  }
};

/**
 * عرض تفاصيل نوع عقار محدد
 */
exports.getPropertyType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const propertyType = await PropertyType.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Property,
          as: 'Properties',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'location', 'full_price', 'rating'],
          limit: 5, // أول 5 عقارات كأمثلة
          order: [['rating', 'DESC']]
        }
      ]
    });

    if (!propertyType) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_TYPE_NOT_FOUND'
      });
    }

    return res.json({
      status: true,
      data: propertyType
    });

  } catch (error) {
    next(error);
  }
};

/**
 * تحديث نوع عقار
 */
exports.updatePropertyType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const propertyType = await PropertyType.findByPk(id);
    if (!propertyType) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_TYPE_NOT_FOUND'
      });
    }

    await propertyType.update(updateData);

    return res.json({
      status: true,
      message: 'تم تحديث نوع العقار بنجاح',
      data: propertyType
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: false,
        message: 'PROPERTY_TYPE_NAME_EXISTS',
        errors: error.errors
      });
    }
    next(error);
  }
};

/**
 * حذف نوع عقار (منطقي)
 */
exports.deletePropertyType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const propertyType = await PropertyType.findByPk(id);
    if (!propertyType) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_TYPE_NOT_FOUND'
      });
    }

    // التحقق من وجود عقارات مرتبطة
    const propertiesCount = await Property.count({
      where: { type_id: id, is_active: true }
    });

    if (propertiesCount > 0) {
      return res.status(400).json({
        status: false,
        message: 'CANNOT_DELETE_TYPE_WITH_PROPERTIES',
        data: { properties_count: propertiesCount }
      });
    }

    // حذف منطقي
    await propertyType.update({ is_active: false });

    return res.json({
      status: true,
      message: 'تم حذف نوع العقار بنجاح'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * إضافة أنواع العقارات الافتراضية
 */
exports.seedPropertyTypes = async (req, res, next) => {
  try {
    const defaultTypes = [
      {
        name_en: 'Hotel',
        name_ar: 'فندق',
        description_en: 'Hotel rooms and suites',
        description_ar: 'غرف وأجنحة فندقية',
        icon: 'hotel'
      },
      {
        name_en: 'Apartment',
        name_ar: 'شقة',
        description_en: 'Furnished apartments',
        description_ar: 'شقق مفروشة',
        icon: 'apartment'
      },
      {
        name_en: 'Room',
        name_ar: 'غرفة',
        description_en: 'Private rooms',
        description_ar: 'غرف خاصة',
        icon: 'room'
      },
      {
        name_en: 'Villa',
        name_ar: 'فيلا',
        description_en: 'Private villas',
        description_ar: 'فيلل خاصة',
        icon: 'villa'
      },
      {
        name_en: 'Chalet',
        name_ar: 'شاليه',
        description_en: 'Vacation chalets',
        description_ar: 'شاليهات سياحية',
        icon: 'chalet'
      }
    ];

    const createdTypes = [];
    for (const typeData of defaultTypes) {
      try {
        const [type, created] = await PropertyType.findOrCreate({
          where: { name_en: typeData.name_en },
          defaults: typeData
        });
        if (created) {
          createdTypes.push(type);
        }
      } catch (error) {
        // تجاهل أخطاء التكرار
        continue;
      }
    }

    return res.json({
      status: true,
      message: `تم إنشاء ${createdTypes.length} نوع عقار جديد`,
      data: createdTypes
    });

  } catch (error) {
    next(error);
  }
};

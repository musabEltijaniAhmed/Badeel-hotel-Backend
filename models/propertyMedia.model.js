const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyMedia = sequelize.define('PropertyMedia', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'معرف العقار'
    },
    media_type: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
      defaultValue: 'image',
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'رابط الصورة أو الفيديو',
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'النص البديل للصورة',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'عنوان الوسيط',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'وصف الوسيط',
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'ترتيب العرض',
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'الصورة الرئيسية',
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'حجم الملف بالبايت',
    },
    file_format: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'صيغة الملف (jpg, png, mp4)',
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'عرض الصورة/الفيديو',
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ارتفاع الصورة/الفيديو',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'مدة الفيديو بالثواني',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'المستخدم الذي رفع الوسيط'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'PropertyMedia',
    indexes: [
      {
        fields: ['property_id']
      },
      {
        fields: ['media_type']
      },
      {
        fields: ['display_order']
      },
      {
        fields: ['is_primary']
      },
      {
        unique: true,
        fields: ['property_id', 'is_primary'],
        name: 'unique_primary_per_property',
        where: {
          is_primary: true
        }
      }
    ]
  });

  return PropertyMedia;
};

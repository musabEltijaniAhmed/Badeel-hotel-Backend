const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PropertyTypes',
        key: 'id'
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    full_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'السعر الكامل للوحدة',
    },
    deposit_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false,
      defaultValue: 'percentage',
      comment: 'نوع المقدم: نسبة مئوية أو مبلغ ثابت',
    },
    deposit_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'قيمة المقدم (نسبة أو مبلغ)',
    },
    calculated_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'المقدم المحسوب (يتم حسابه تلقائياً)',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'سعة الأشخاص',
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'عدد غرف النوم',
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'عدد دورات المياه',
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'المرافق والخدمات [wifi, parking, pool]',
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '15:00:00',
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '12:00:00',
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'عقار مميز',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'التقييم من 0-5',
    },
    reviews_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'المستخدم الذي أضاف العقار',
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
    tableName: 'Properties',
    hooks: {
      beforeSave: (property) => {
        // حساب المقدم تلقائياً
        if (property.deposit_type === 'percentage') {
          property.calculated_deposit = (property.full_price * property.deposit_value) / 100;
        } else {
          property.calculated_deposit = property.deposit_value;
        }
      }
    },
    indexes: [
      {
        fields: ['type_id']
      },
      {
        fields: ['location']
      },
      {
        fields: ['is_available', 'is_active']
      },
      {
        fields: ['featured']
      },
      {
        fields: ['rating']
      }
    ]
  });

  return Property;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PropertyType = sequelize.define('PropertyType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name_ar: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_ar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'أيقونة النوع (hotel, apartment, room)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'PropertyTypes',
    indexes: [
      {
        unique: true,
        fields: ['name_en']
      },
      {
        unique: true,
        fields: ['name_ar']
      }
    ]
  });

  return PropertyType;
};

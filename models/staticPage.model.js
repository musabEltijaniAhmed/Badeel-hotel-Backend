const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaticPage = sequelize.define('StaticPage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9-]+$/
    }
  },
  title_ar: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  title_en: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content_ar: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  content_en: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'static_pages',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
  });

  return StaticPage;
};

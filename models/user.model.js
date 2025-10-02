const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    language: {
      type: DataTypes.ENUM('en', 'ar'),
      defaultValue: 'en',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Roles',
        key: 'id'
      },
      comment: 'دور المستخدم في النظام',
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Firebase Cloud Messaging token for push notifications',
    },
  }, {
    tableName: 'Users',
    underscored: false,
    timestamps: true
  });
  return User;
}; 
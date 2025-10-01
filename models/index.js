const { Sequelize, DataTypes } = require('sequelize');
const { sequelize, connectWithRetry } = require('../config/db');

const models = {};
models.PaymentMethod = require('./paymentMethod.model')(sequelize, DataTypes);
models.User = require('./user.model')(sequelize, DataTypes);
models.Admin = require('./admin.model')(sequelize, DataTypes);
models.Room = require('./room.model')(sequelize, DataTypes);
models.Booking = require('./booking.model')(sequelize, DataTypes);
models.Review = require('./review.model')(sequelize, DataTypes);
models.Notification = require('./notification.model')(sequelize, DataTypes);
models.PasswordReset = require('./passwordReset.model')(sequelize, DataTypes);
models.ActivityLog = require('./activityLog.model')(sequelize, DataTypes);
models.Tenant = require('./tenant.model')(sequelize, DataTypes);
models.Coupon = require('./coupons.model')(sequelize, DataTypes);
models.Role = require('./role.model')(sequelize, DataTypes);
models.Permission = require('./permission.model')(sequelize, DataTypes);
models.RolePermission = require('./rolePermission.model')(sequelize, DataTypes);
models.PropertyType = require('./propertyType.model')(sequelize, DataTypes);
models.Property = require('./property.model')(sequelize, DataTypes);
models.PropertyMedia = require('./propertyMedia.model')(sequelize, DataTypes);
models.StaticPage = require('./staticPage.model')(sequelize, DataTypes);
models.SystemSetting = require('./systemSetting.model')(sequelize, DataTypes);

// Associations
models.Booking.belongsTo(models.User, { foreignKey: 'userId' });
models.Booking.belongsTo(models.Room, { foreignKey: 'roomId' });
models.Booking.belongsTo(models.Coupon, { foreignKey: 'couponId' });

models.Review.belongsTo(models.Booking, { foreignKey: 'bookingId' });
models.Review.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
models.Review.belongsTo(models.Property, { foreignKey: 'propertyId', as: 'PropertyReview' });

models.Notification.belongsTo(models.User, { foreignKey: 'userId' });

// Role and Permission Associations
models.User.belongsTo(models.Role, { foreignKey: 'roleId' });
models.Role.hasMany(models.User, { foreignKey: 'roleId' });

models.Role.belongsToMany(models.Permission, { 
  through: models.RolePermission, 
  foreignKey: 'roleId',
  otherKey: 'permissionId' 
});
models.Permission.belongsToMany(models.Role, { 
  through: models.RolePermission, 
  foreignKey: 'permissionId',
  otherKey: 'roleId' 
});

models.RolePermission.belongsTo(models.Role, { foreignKey: 'roleId' });
models.RolePermission.belongsTo(models.Permission, { foreignKey: 'permissionId' });

// Property and PropertyType Associations
models.Property.belongsTo(models.PropertyType, { foreignKey: 'type_id', as: 'PropertyType' });
models.PropertyType.hasMany(models.Property, { foreignKey: 'type_id', as: 'Properties' });

// Property and User Associations
models.Property.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator' });
models.User.hasMany(models.Property, { foreignKey: 'created_by', as: 'CreatedProperties' });

// Property and PropertyMedia Associations
models.Property.hasMany(models.PropertyMedia, { foreignKey: 'property_id', as: 'Media' });
models.PropertyMedia.belongsTo(models.Property, { foreignKey: 'property_id', as: 'PropertyMedia' });

// PropertyMedia and User Associations
models.PropertyMedia.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'Uploader' });
models.User.hasMany(models.PropertyMedia, { foreignKey: 'uploaded_by', as: 'UploadedMedia' });

// Booking and Property Associations (New System)
models.Booking.belongsTo(models.Property, { foreignKey: 'property_id', as: 'PropertyBooking' });
models.Property.hasMany(models.Booking, { foreignKey: 'property_id', as: 'Bookings' });

// Property and Review Associations
models.Property.hasMany(models.Review, { foreignKey: 'propertyId', as: 'Reviews' });

// User and Review Associations
models.User.hasMany(models.Review, { foreignKey: 'userId', as: 'UserReviews' });

// StaticPage and User Associations
models.StaticPage.belongsTo(models.User, { foreignKey: 'updated_by', as: 'Updater' });
models.User.hasMany(models.StaticPage, { foreignKey: 'updated_by', as: 'UpdatedPages' });

// SystemSetting and User Associations
models.SystemSetting.belongsTo(models.User, { foreignKey: 'updated_by', as: 'Updater' });
models.User.hasMany(models.SystemSetting, { foreignKey: 'updated_by', as: 'UpdatedSettings' });

module.exports = { sequelize, connectWithRetry, ...models }; 
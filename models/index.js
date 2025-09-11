const { sequelize, connectWithRetry } = require('../config/db');

const models = {};
models.User = require('./user.model')(sequelize);
models.Admin = require('./admin.model')(sequelize);
models.Room = require('./room.model')(sequelize);
models.Booking = require('./booking.model')(sequelize);
models.Review = require('./review.model')(sequelize);
models.Notification = require('./notification.model')(sequelize);
models.PasswordReset = require('./passwordReset.model')(sequelize);
models.ActivityLog = require('./activityLog.model')(sequelize);
models.Tenant = require('./tenant.model')(sequelize);
models.Coupon = require('./coupons.model')(sequelize);
models.Role = require('./role.model')(sequelize);
models.Permission = require('./permission.model')(sequelize);
models.RolePermission = require('./rolePermission.model')(sequelize);
models.PropertyType = require('./propertyType.model')(sequelize);
models.Property = require('./property.model')(sequelize);
models.PropertyMedia = require('./propertyMedia.model')(sequelize);
models.StaticPage = require('./staticPage.model')(sequelize);

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

// StaticPage and Admin Associations
models.StaticPage.belongsTo(models.Admin, { foreignKey: 'updated_by', as: 'Updater' });
models.Admin.hasMany(models.StaticPage, { foreignKey: 'updated_by', as: 'UpdatedPages' });

module.exports = { sequelize, connectWithRetry, ...models }; 
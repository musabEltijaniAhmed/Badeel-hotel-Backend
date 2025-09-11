const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    adminId: { type: DataTypes.UUID, allowNull: false },
    action: DataTypes.STRING,
    entity: DataTypes.STRING,
    meta: DataTypes.JSON,
  });
  return ActivityLog;
}; 
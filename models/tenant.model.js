const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: DataTypes.STRING,
  });
  return Tenant;
}; 
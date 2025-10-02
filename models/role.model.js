const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Role name is required' },
        len: {
          args: [2, 50],
          msg: 'Role name must be between 2 and 50 characters'
        },
        is: {
          args: /^[a-z_]+$/,
          msg: 'Role name must contain only lowercase letters and underscores'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'Roles',
    timestamps: true,
  });

  return Role;
};

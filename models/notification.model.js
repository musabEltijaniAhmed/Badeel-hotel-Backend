const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    data: DataTypes.JSON,
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: DataTypes.STRING
    // created_by: {
    //   type: DataTypes.UUID,
    //   allowNull: true,
    //   references: {
    //     model: 'Users',
    //     key: 'id'
    //   }
    // } // Temporarily disabled until column is added to database
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    // Notification.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator' }); // Temporarily disabled
  };

  return Notification;
}; 
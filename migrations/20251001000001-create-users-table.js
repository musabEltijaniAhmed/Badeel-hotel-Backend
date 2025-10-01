'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create admin user
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'admin' LIMIT 1`
    );

    if (adminRole[0]) {
      await queryInterface.bulkInsert('Users', [{
        id: Sequelize.literal('UUID()'),
        name: 'System Admin',
        email: 'admin@example.com',
        password: '$2b$10$YaB6xpBcJe8Nc0TrEaFqF.LxDCUBWuGP9tZ8eBbfoRxM2nCvNz9Vy', // password: admin123
        roleId: adminRole[0].id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};

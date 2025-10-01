'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add system:manage permission
    // Create the permission
    await queryInterface.bulkInsert('Permissions', [{
      name: 'system_manage',
      description: 'إدارة إعدادات النظام',
      resource: 'system',
      action: 'manage',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Get admin role
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'admin' LIMIT 1`
    );

    if (adminRole[0]) {
      // Get the permission ID
      const [permission] = await queryInterface.sequelize.query(
        `SELECT id FROM Permissions WHERE resource = 'system' AND action = 'manage' LIMIT 1`
      );

      if (permission[0]) {
        // Link permission to admin role
        await queryInterface.bulkInsert('RolePermissions', [{
          roleId: adminRole[0].id,
          permissionId: permission[0].id,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove permission from roles
    // Remove permission from roles
    await queryInterface.sequelize.query(
      `DELETE FROM RolePermissions WHERE permissionId IN (
        SELECT id FROM Permissions WHERE resource = 'system' AND action = 'manage'
      )`
    );

    // Remove permission
    await queryInterface.sequelize.query(
      `DELETE FROM Permissions WHERE resource = 'system' AND action = 'manage'`
    );
  }
};

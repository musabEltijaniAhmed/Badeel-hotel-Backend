'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, delete existing payment method permissions
    await queryInterface.bulkDelete('Permissions', {
      resource: 'payment_methods'
    });

    // Create new permissions with correct format
    const permissions = [
      {
        name: 'payment_methods_view',
        description: 'عرض طرق الدفع',
        resource: 'payment_methods',
        action: 'view',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'payment_methods_create',
        description: 'إنشاء طريقة دفع',
        resource: 'payment_methods',
        action: 'create',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'payment_methods_edit',
        description: 'تحديث طريقة دفع',
        resource: 'payment_methods',
        action: 'edit',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'payment_methods_delete',
        description: 'حذف طريقة دفع',
        resource: 'payment_methods',
        action: 'delete',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert new permissions
    const createdPermissions = await queryInterface.bulkInsert('Permissions', permissions, { returning: true });

    // Get admin role
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'admin'`
    );

    if (adminRole[0]) {
      // Create role-permission associations
      const rolePermissions = permissions.map(permission => ({
        roleId: adminRole[0].id,
        permissionId: permission.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('RolePermissions', rolePermissions);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', {
      resource: 'payment_methods'
    });
  }
};

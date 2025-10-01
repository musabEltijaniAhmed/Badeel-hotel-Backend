require('dotenv').config();
const { sequelize, Role, Permission, RolePermission } = require('../models');

async function fixPaymentPermissions() {
  try {
    console.log('🔄 Fixing payment method permissions...');

    // Delete existing payment method permissions
    await RolePermission.destroy({
      where: {
        permissionId: {
          [sequelize.Sequelize.Op.in]: sequelize.literal(
            '(SELECT id FROM Permissions WHERE resource = "payment_methods")'
          )
        }
      }
    });
    console.log('✅ Deleted old role-permission links');

    await Permission.destroy({
      where: { resource: 'payment_methods' }
    });
    console.log('✅ Deleted old permissions');

    // Create new permissions
    const permissions = [
      {
        name: 'payment_methods_view',
        description: 'عرض طرق الدفع',
        resource: 'payment_methods',
        action: 'view',
        isActive: true
      },
      {
        name: 'payment_methods_create',
        description: 'إنشاء طريقة دفع',
        resource: 'payment_methods',
        action: 'create',
        isActive: true
      },
      {
        name: 'payment_methods_edit',
        description: 'تحديث طريقة دفع',
        resource: 'payment_methods',
        action: 'edit',
        isActive: true
      },
      {
        name: 'payment_methods_delete',
        description: 'حذف طريقة دفع',
        resource: 'payment_methods',
        action: 'delete',
        isActive: true
      }
    ];

    const createdPermissions = await Permission.bulkCreate(permissions);
    console.log('✅ Created new permissions');

    // Get admin role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Link permissions to admin role
    const rolePermissions = createdPermissions.map(permission => ({
      roleId: adminRole.id,
      permissionId: permission.id
    }));

    await RolePermission.bulkCreate(rolePermissions);
    console.log('✅ Linked permissions to admin role');

    console.log('✅ All done! Payment method permissions have been fixed.');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixPaymentPermissions()
    .then(() => {
      console.log('🎉 Successfully fixed payment method permissions');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to fix permissions:', error);
      process.exit(1);
    });
}

module.exports = { fixPaymentPermissions };

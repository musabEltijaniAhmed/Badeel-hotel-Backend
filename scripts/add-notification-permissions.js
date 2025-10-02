require('dotenv').config();
const { sequelize, Role, Permission, RolePermission } = require('../models');

async function addNotificationPermissions() {
  try {
    console.log('🔄 Adding notification permissions...');

    // Create permissions
    const permissions = [
      { 
        name: 'notifications_view',
        description: 'عرض الإشعارات',
        resource: 'notifications',
        action: 'view'
      },
      { 
        name: 'notifications_send',
        description: 'إرسال الإشعارات',
        resource: 'notifications',
        action: 'send'
      }
    ];

    for (const permission of permissions) {
      const [perm, created] = await Permission.findOrCreate({
        where: { 
          resource: permission.resource,
          action: permission.action
        },
        defaults: permission
      });

      console.log(`  ${created ? '✅ Created' : '⏩ Already exists'}: ${permission.name}`);
    }

    // Get admin role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Get the permissions
    const notificationPermissions = await Permission.findAll({
      where: {
        resource: 'notifications'
      }
    });

    // Link permissions to admin role
    for (const permission of notificationPermissions) {
      const [rolePermission, created] = await RolePermission.findOrCreate({
        where: {
          roleId: adminRole.id,
          permissionId: permission.id
        },
        defaults: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });

      console.log(`  ${created ? '✅ Linked' : '⏩ Already linked'}: ${permission.name} to admin role`);
    }

    console.log('✅ Notification permissions setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addNotificationPermissions()
    .then(() => {
      console.log('🏁 Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { addNotificationPermissions };

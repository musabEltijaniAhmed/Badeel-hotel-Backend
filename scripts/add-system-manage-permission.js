const { Permission, Role, RolePermission } = require('../models');

async function addSystemManagePermission() {
  try {
    // Create the permission
    const [permission, created] = await Permission.findOrCreate({
      where: { resource: 'system', action: 'manage' },
      defaults: {
        name: 'system_manage',
        description: 'إدارة إعدادات النظام',
        isActive: true
      }
    });

    if (!created) {
      console.log('Permission already exists');
      return;
    }

    // Get admin role
    const adminRole = await Role.findOne({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }

    // Link permission to admin role
    await RolePermission.create({
      roleId: adminRole.id,
      permissionId: permission.id
    });

    console.log('Successfully added system:manage permission and linked it to admin role');
  } catch (error) {
    console.error('Error:', error);
  }
}

addSystemManagePermission();

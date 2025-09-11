require('dotenv').config();
const { sequelize } = require('../config/db');

async function setupRolesSystem() {
  try {
    console.log('🔄 جاري إعداد نظام الأدوار والصلاحيات...');

    // 1. إنشاء جدول الأدوار
    console.log('➡️ إنشاء جدول الأدوار...');
    await sequelize.getQueryInterface().createTable('Roles', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
      },
      isActive: {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // 2. إدراج الأدوار الأساسية
    console.log('➡️ إضافة الأدوار الأساسية...');
    await sequelize.getQueryInterface().bulkInsert('Roles', [
      {
        id: 1,
        name: 'customer',
        description: 'عميل - يمكنه تصفح المنتجات وإنشاء الطلبات',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'admin',
        description: 'مدير النظام - له كامل الصلاحيات',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'staff',
        description: 'موظف - له صلاحيات محدودة حسب المنصب',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { ignoreDuplicates: true });

    // 3. إنشاء جدول الصلاحيات
    console.log('➡️ إنشاء جدول الصلاحيات...');
    await sequelize.getQueryInterface().createTable('Permissions', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
      },
      resource: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
      },
      action: {
        type: sequelize.Sequelize.STRING,
        allowNull: false,
      },
      isActive: {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // 4. إنشاء جدول الربط
    console.log('➡️ إنشاء جدول ربط الأدوار بالصلاحيات...');
    await sequelize.getQueryInterface().createTable('RolePermissions', {
      id: {
        type: sequelize.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permissionId: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // 5. إضافة حقل roleId لجدول Users
    console.log('➡️ إضافة حقل roleId لجدول Users...');
    try {
      await sequelize.getQueryInterface().addColumn('Users', 'roleId', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION'
      });
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        console.log('   ℹ️ حقل roleId موجود بالفعل في جدول Users');
      } else {
        throw error;
      }
    }

    console.log('✅ تم إعداد نظام الأدوار والصلاحيات بنجاح!');

  } catch (error) {
    if (error.original && error.original.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️ الجداول موجودة بالفعل - تم تخطي الإنشاء');
    } else {
      console.error('❌ خطأ في إعداد نظام الأدوار:', error.message);
      throw error;
    }
  }
}

// تشغيل الإعداد
if (require.main === module) {
  setupRolesSystem()
    .then(() => {
      console.log('🏁 انتهى إعداد نظام الأدوار والصلاحيات');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في إعداد نظام الأدوار:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { setupRolesSystem };

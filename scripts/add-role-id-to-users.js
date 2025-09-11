require('dotenv').config();
const { sequelize } = require('../config/db');

async function addRoleIdToUsers() {
  try {
    console.log('🔄 جاري إضافة حقل roleId لجدول المستخدمين...');

    // إضافة حقل roleId
    await sequelize.getQueryInterface().addColumn('Users', 'roleId', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // customer by default
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION'
    });

    console.log('✅ تم إضافة حقل roleId بنجاح');

    // تحديث المستخدمين الموجودين ليكونوا عملاء افتراضياً
    await sequelize.query('UPDATE Users SET roleId = 1 WHERE roleId IS NULL');
    
    console.log('✅ تم تحديث المستخدمين الموجودين');

  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ حقل roleId موجود بالفعل');
    } else {
      console.error('❌ خطأ في إضافة حقل roleId:', error.message);
      throw error;
    }
  }
}

// تشغيل الإضافة
if (require.main === module) {
  addRoleIdToUsers()
    .then(() => {
      console.log('🏁 انتهى إضافة حقل roleId');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في إضافة حقل roleId:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { addRoleIdToUsers };

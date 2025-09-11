require('dotenv').config();
const { sequelize } = require('../config/db');

async function runMigration() {
  try {
    console.log('🔄 جاري تطبيق Migration للكوبونات...');
    
    // إضافة حقل used_count للكوبونات
    console.log('➡️ إضافة حقل used_count لجدول Coupons...');
    await sequelize.getQueryInterface().addColumn('Coupons', 'used_count', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // إضافة حقول الكوبون للحجوزات
    console.log('➡️ إضافة حقول الكوبون لجدول Bookings...');
    
    await sequelize.getQueryInterface().addColumn('Bookings', 'couponCode', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('Bookings', 'originalAmount', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true,
    });

    await sequelize.getQueryInterface().addColumn('Bookings', 'discountAmount', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });

    await sequelize.getQueryInterface().addColumn('Bookings', 'finalAmount', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true,
    });

    console.log('✅ تم تطبيق Migration بنجاح!');
    console.log('🎉 النظام جاهز لاستخدام الكوبونات!');
    
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ الحقول موجودة بالفعل - Migration تم تطبيقه مسبقاً');
    } else {
      console.error('❌ خطأ في تطبيق Migration:', error.message);
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// تشغيل Migration
runMigration()
  .then(() => {
    console.log('🏁 انتهى تطبيق Migration');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل في تطبيق Migration:', error);
    process.exit(1);
  });

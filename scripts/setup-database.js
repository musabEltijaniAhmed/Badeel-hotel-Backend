require('dotenv').config();
const { sequelize } = require('../config/db');
// استثناء نماذج الأدوار مؤقتاً لتجنب مشكلة foreign key
const { User, Admin, Room, Booking, Review, Notification, PasswordReset, ActivityLog, Tenant, Coupon, PropertyType, Property, PropertyMedia } = require('../models');

async function setupDatabase() {
  try {
    console.log('🔄 جاري إعداد قاعدة البيانات...');
    
    // اختبار الاتصال
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    // مزامنة النماذج (إنشاء الجداول) بدون نماذج الأدوار
    console.log('🔄 جاري إنشاء/تحديث الجداول الأساسية...');
    
    // ترتيب النماذج حسب الأولوية (النماذج التي لا تحتاج foreign keys أولاً)
    const basicModels = [User, Admin, Room, Review, Notification, PasswordReset, ActivityLog, Tenant, Coupon];
    const propertyModels = [PropertyType, Property, PropertyMedia]; // PropertyType أولاً، ثم Property، ثم PropertyMedia
    const bookingModels = [Booking]; // Booking أخيراً لأنه يرتبط بـ Property
    
    const modelsToSync = [...basicModels, ...propertyModels, ...bookingModels];
    
    for (const model of modelsToSync) {
      try {
        console.log(`📋 إنشاء/تحديث جدول: ${model.tableName}`);
        await model.sync({ force: false, alter: false });
        console.log(`✅ ${model.tableName}`);
      } catch (error) {
        console.error(`❌ خطأ في ${model.tableName}:`, error.message);
        // نكمل مع باقي الجداول
      }
    }
    
    console.log('✅ تم إعداد قاعدة البيانات بنجاح!');
    console.log('📋 الجداول الموجودة:');
    
    // عرض قائمة الجداول
    const tables = await sequelize.getQueryInterface().showAllTables();
    tables.forEach(table => console.log(`  - ${table}`));
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// تشغيل الإعداد
setupDatabase()
  .then(() => {
    console.log('🏁 انتهى إعداد قاعدة البيانات');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 فشل في إعداد قاعدة البيانات:', error);
    process.exit(1);
  });

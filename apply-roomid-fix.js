#!/usr/bin/env node

// Script لتطبيق إصلاح roomId مباشرة
const { sequelize } = require('./models');

async function applyRoomIdFix() {
  try {
    console.log('🔧 تطبيق إصلاح عمود roomId...');
    
    // تحديث العمود لإضافة القيمة الافتراضية
    await sequelize.query(`
      ALTER TABLE Bookings 
      MODIFY COLUMN roomId VARCHAR(36) NULL DEFAULT NULL
    `);
    
    console.log('✅ تم إصلاح عمود roomId بنجاح!');
    
    // التحقق من التغيير
    const [results] = await sequelize.query(`
      DESCRIBE Bookings
    `);
    
    console.log('\n📋 هيكل جدول Bookings:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح قاعدة البيانات:', error.message);
  } finally {
    await sequelize.close();
  }
}

applyRoomIdFix();

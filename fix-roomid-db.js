#!/usr/bin/env node

// Script لإصلاح عمود roomId في قاعدة البيانات
const mysql = require('mysql2/promise');

async function fixRoomIdDefault() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'booking_db'
  });

  try {
    console.log('إصلاح عمود roomId في جدول Bookings...');
    
    // تحديث العمود لإضافة القيمة الافتراضية
    await connection.execute(`
      ALTER TABLE Bookings 
      MODIFY COLUMN roomId VARCHAR(36) NULL DEFAULT NULL
    `);
    
    console.log('✅ تم إصلاح عمود roomId بنجاح!');
    
    // التحقق من التغيير
    const [columns] = await connection.execute(`
      DESCRIBE Bookings
    `);
    
    console.log('\n📋 هيكل جدول Bookings:');
    console.table(columns);
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح قاعدة البيانات:', error.message);
  } finally {
    await connection.end();
  }
}

fixRoomIdDefault();

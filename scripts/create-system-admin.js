require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const { connectWithRetry } = require('../config/db');

async function createSystemAdmin() {
  try {
    console.log('🔧 جاري إنشاء المدير الثابت للنظام...');
    
    // الاتصال بقاعدة البيانات
    await connectWithRetry();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // بيانات المدير الثابت (من متغيرات البيئة أو القيم الافتراضية)
    const SYSTEM_ADMIN = {
      name: process.env.SYSTEM_ADMIN_NAME || 'System Administrator',
      phone: process.env.SYSTEM_ADMIN_PHONE || '+966500000000',
      email: process.env.SYSTEM_ADMIN_EMAIL || 'admin@booking-system.com',
      password: process.env.SYSTEM_ADMIN_PASSWORD || 'Admin@123456', // كلمة مرور قوية افتراضية
      language: 'ar',
      roleId: 2 // دور المدير
    };

    console.log('🔍 التحقق من وجود المدير الثابت...');
    
    // التحقق من وجود المدير مسبقاً
    const existingAdmin = await User.findOne({
      where: { 
        phone: SYSTEM_ADMIN.phone 
      },
      include: [{ model: Role }]
    });

    if (existingAdmin) {
      console.log('ℹ️  المدير الثابت موجود مسبقاً:');
      console.log(`   📱 الهاتف: ${existingAdmin.phone}`);
      console.log(`   📧 الإيميل: ${existingAdmin.email}`);
      console.log(`   👤 الاسم: ${existingAdmin.name}`);
      console.log(`   🎭 الدور: ${existingAdmin.Role?.name || 'غير محدد'}`);
      
      // تحديث كلمة المرور إذا كانت ضعيفة
      if (existingAdmin.password.length < 60) { // إذا لم تكن مشفرة بـ bcrypt
        console.log('🔒 تحديث كلمة مرور المدير...');
        const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN.password, 12);
        await existingAdmin.update({ 
          password: hashedPassword,
          roleId: 2 // تأكيد دور المدير
        });
        console.log('✅ تم تحديث كلمة مرور المدير');
      }
      
      return;
    }

    console.log('➕ إنشاء المدير الثابت...');
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN.password, 12);
    
    // إنشاء المدير الجديد
    const newAdmin = await User.create({
      ...SYSTEM_ADMIN,
      password: hashedPassword,
      token: 'system-admin-token' // رمز مؤقت
    });

    console.log('✅ تم إنشاء المدير الثابت بنجاح!');
    console.log('\n📋 بيانات تسجيل الدخول:');
    console.log('═══════════════════════════════════════');
    console.log(`📱 رقم الهاتف: ${SYSTEM_ADMIN.phone}`);
    console.log(`📧 الإيميل: ${SYSTEM_ADMIN.email}`);
    console.log(`🔑 كلمة المرور: ${SYSTEM_ADMIN.password}`);
    console.log(`👤 الاسم: ${SYSTEM_ADMIN.name}`);
    console.log(`🎭 الدور: مدير النظام`);
    console.log('═══════════════════════════════════════');
    
    console.log('\n⚠️  تحذيرات أمنية:');
    console.log('1. يُنصح بتغيير كلمة المرور فور تسجيل الدخول');
    console.log('2. تأكد من حماية بيانات تسجيل الدخول');
    console.log('3. لا تشارك هذه البيانات مع أي شخص غير مخول');
    
    return newAdmin;

  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير الثابت:', error.message);
    throw error;
  }
}

// تشغيل الدالة
if (require.main === module) {
  createSystemAdmin()
    .then(() => {
      console.log('\n🎉 تم الانتهاء من إعداد المدير الثابت');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في إنشاء المدير الثابت:', error);
      process.exit(1);
    });
}

module.exports = createSystemAdmin;

require('dotenv').config();
const { sequelize, Role, Permission, RolePermission } = require('../models');

// البيانات الأساسية للأدوار
const roles = [
  {
    id: 1,
    name: 'customer',
    description: 'عميل - يمكنه تصفح المنتجات وإنشاء الطلبات'
  },
  {
    id: 2,
    name: 'admin',
    description: 'مدير النظام - له كامل الصلاحيات'
  },
  {
    id: 3,
    name: 'staff',
    description: 'موظف - له صلاحيات محدودة حسب المنصب'
  }
];

// البيانات الأساسية للصلاحيات
const permissions = [
  // صلاحيات العقارات
  { name: 'view_properties', description: 'عرض العقارات', resource: 'properties', action: 'view' },
  { name: 'create_property', description: 'إنشاء عقار جديد', resource: 'properties', action: 'create' },
  { name: 'edit_property', description: 'تعديل عقار', resource: 'properties', action: 'edit' },
  { name: 'delete_property', description: 'حذف عقار', resource: 'properties', action: 'delete' },
  
  // صلاحيات المنتجات/الغرف
  { name: 'view_rooms', description: 'عرض الغرف', resource: 'rooms', action: 'view' },
  { name: 'create_room', description: 'إنشاء غرفة جديدة', resource: 'rooms', action: 'create' },
  { name: 'edit_room', description: 'تعديل غرفة', resource: 'rooms', action: 'edit' },
  { name: 'delete_room', description: 'حذف غرفة', resource: 'rooms', action: 'delete' },

  // صلاحيات الحجوزات
  { name: 'view_bookings', description: 'عرض الحجوزات', resource: 'bookings', action: 'view' },
  { name: 'create_booking', description: 'إنشاء حجز', resource: 'bookings', action: 'create' },
  { name: 'edit_booking', description: 'تعديل حجز', resource: 'bookings', action: 'edit' },
  { name: 'cancel_booking', description: 'إلغاء حجز', resource: 'bookings', action: 'cancel' },
  { name: 'view_all_bookings', description: 'عرض جميع الحجوزات', resource: 'bookings', action: 'view_all' },

  // صلاحيات الكوبونات
  { name: 'view_coupons', description: 'عرض الكوبونات', resource: 'coupons', action: 'view' },
  { name: 'create_coupon', description: 'إنشاء كوبون', resource: 'coupons', action: 'create' },
  { name: 'edit_coupon', description: 'تعديل كوبون', resource: 'coupons', action: 'edit' },
  { name: 'delete_coupon', description: 'حذف كوبون', resource: 'coupons', action: 'delete' },
  { name: 'use_coupon', description: 'استخدام كوبون', resource: 'coupons', action: 'use' },

  // صلاحيات المستخدمين
  { name: 'view_users', description: 'عرض المستخدمين', resource: 'users', action: 'view' },
  { name: 'create_user', description: 'إنشاء مستخدم', resource: 'users', action: 'create' },
  { name: 'edit_user', description: 'تعديل مستخدم', resource: 'users', action: 'edit' },
  { name: 'delete_user', description: 'حذف مستخدم', resource: 'users', action: 'delete' },
  { name: 'edit_profile', description: 'تعديل الملف الشخصي', resource: 'users', action: 'edit_profile' },

  // صلاحيات التقارير
  { name: 'view_reports', description: 'عرض التقارير', resource: 'reports', action: 'view' },
  { name: 'export_reports', description: 'تصدير التقارير', resource: 'reports', action: 'export' },

  // صلاحيات الدعم الفني
  { name: 'view_support', description: 'عرض تذاكر الدعم', resource: 'support', action: 'view' },
  { name: 'respond_support', description: 'الرد على تذاكر الدعم', resource: 'support', action: 'respond' },

  // صلاحيات النظام
  { name: 'manage_settings', description: 'إدارة إعدادات النظام', resource: 'system', action: 'manage' },
  { name: 'manage_roles', description: 'إدارة الأدوار والصلاحيات', resource: 'roles', action: 'manage' },

  // صلاحيات التقييمات
  { name: 'view_reviews', description: 'عرض التقييمات', resource: 'reviews', action: 'view' },
  { name: 'create_review', description: 'إنشاء تقييم', resource: 'reviews', action: 'create' },
  { name: 'moderate_reviews', description: 'الإشراف على التقييمات', resource: 'reviews', action: 'moderate' },
];

// ربط الأدوار بالصلاحيات
const rolePermissions = {
  // صلاحيات العملاء (customer)
  customer: [
    'view_rooms',
    'view_bookings', 'create_booking', 'cancel_booking',
    'use_coupon',
    'edit_profile',
    'create_review', 'view_reviews'
  ],

  // صلاحيات المديرين (admin) - كامل الصلاحيات
  admin: [
    'view_properties', 'create_property', 'edit_property', 'delete_property',
    'view_rooms', 'create_room', 'edit_room', 'delete_room',
    'view_bookings', 'create_booking', 'edit_booking', 'cancel_booking', 'view_all_bookings',
    'view_coupons', 'create_coupon', 'edit_coupon', 'delete_coupon', 'use_coupon',
    'view_users', 'create_user', 'edit_user', 'delete_user', 'edit_profile',
    'view_reports', 'export_reports',
    'view_support', 'respond_support',
    'manage_settings', 'manage_roles',
    'view_reviews', 'create_review', 'moderate_reviews'
  ],

  // صلاحيات الموظفين (staff) - صلاحيات محدودة
  staff: [
    'view_properties', 'create_property', 'edit_property',
    'view_rooms', 'edit_room',
    'view_bookings', 'edit_booking', 'view_all_bookings',
    'view_coupons', 'create_coupon', 'edit_coupon',
    'view_users', 'edit_profile',
    'view_reports',
    'view_support', 'respond_support',
    'view_reviews', 'moderate_reviews'
  ]
};

async function seedPermissions() {
  try {
    console.log('🔄 جاري إضافة البيانات الأساسية للأدوار والصلاحيات...');

    // إنشاء الأدوار
    console.log('➡️ إضافة الأدوار...');
    for (const role of roles) {
      await Role.findOrCreate({
        where: { name: role.name },
        defaults: role
      });
      console.log(`  ✅ تم إضافة دور: ${role.description}`);
    }

    // إنشاء الصلاحيات
    console.log('➡️ إضافة الصلاحيات...');
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
      console.log(`  ✅ تم إضافة صلاحية: ${permission.description}`);
    }

    // ربط الأدوار بالصلاحيات
    console.log('➡️ ربط الأدوار بالصلاحيات...');
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { name: roleName } });
      
      if (role) {
        console.log(`  🔗 ربط صلاحيات دور: ${roleName}`);
        
        for (const permissionName of permissionNames) {
          const permission = await Permission.findOne({ where: { name: permissionName } });
          
          if (permission) {
            await RolePermission.findOrCreate({
              where: {
                roleId: role.id,
                permissionId: permission.id
              },
              defaults: {
                roleId: role.id,
                permissionId: permission.id
              }
            });
          }
        }
        
        console.log(`  ✅ تم ربط ${permissionNames.length} صلاحية لدور ${roleName}`);
      }
    }

    console.log('✅ تم إضافة جميع البيانات الأساسية بنجاح!');
    
    // عرض ملخص
    const totalRoles = await Role.count();
    const totalPermissions = await Permission.count();
    const totalAssignments = await RolePermission.count();
    
    console.log('\n📊 ملخص البيانات:');
    console.log(`  📋 الأدوار: ${totalRoles}`);
    console.log(`  🔐 الصلاحيات: ${totalPermissions}`);
    console.log(`  🔗 الروابط: ${totalAssignments}`);

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error.message);
    throw error;
  }
}

// تشغيل البذر
if (require.main === module) {
  seedPermissions()
    .then(() => {
      console.log('🏁 انتهى إضافة البيانات الأساسية');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشل في إضافة البيانات:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { seedPermissions };

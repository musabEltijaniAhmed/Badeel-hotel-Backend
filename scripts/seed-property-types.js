require('dotenv').config();
const { PropertyType } = require('../models');

/**
 * بذر أنواع العقارات الافتراضية
 */
async function seedPropertyTypes() {
  try {
    console.log('🌱 جاري بذر أنواع العقارات...');

    const defaultTypes = [
      {
        name_en: 'Hotel Room',
        name_ar: 'غرفة فندق',
        description_en: 'Standard hotel rooms with amenities',
        description_ar: 'غرف فندقية عادية مع المرافق',
        icon: 'hotel'
      },
      {
        name_en: 'Apartment',
        name_ar: 'شقة مفروشة',
        description_en: 'Fully furnished apartments for short-term stays',
        description_ar: 'شقق مفروشة بالكامل للإقامة قصيرة المدى',
        icon: 'apartment'
      },
      {
        name_en: 'Private Room',
        name_ar: 'غرفة خاصة',
        description_en: 'Private rooms in shared accommodation',
        description_ar: 'غرف خاصة في سكن مشترك',
        icon: 'room'
      },
      {
        name_en: 'Villa',
        name_ar: 'فيلا',
        description_en: 'Luxury private villas with full amenities',
        description_ar: 'فيلل فاخرة خاصة مع جميع المرافق',
        icon: 'villa'
      },
      {
        name_en: 'Chalet',
        name_ar: 'شاليه',
        description_en: 'Vacation chalets and beach houses',
        description_ar: 'شاليهات سياحية وبيوت شاطئية',
        icon: 'chalet'
      },
      {
        name_en: 'Resort Suite',
        name_ar: 'جناح منتجع',
        description_en: 'Luxury resort suites with premium services',
        description_ar: 'أجنحة منتجعات فاخرة مع خدمات متميزة',
        icon: 'resort'
      }
    ];

    let created = 0;
    let existing = 0;

    for (const typeData of defaultTypes) {
      try {
        const [propertyType, wasCreated] = await PropertyType.findOrCreate({
          where: { name_en: typeData.name_en },
          defaults: typeData
        });

        if (wasCreated) {
          created++;
          console.log(`✅ تم إنشاء: ${typeData.name_ar} (${typeData.name_en})`);
        } else {
          existing++;
          console.log(`ℹ️  موجود مسبقاً: ${typeData.name_ar} (${typeData.name_en})`);
        }
      } catch (error) {
        console.warn(`⚠️  تجاهل خطأ في ${typeData.name_en}:`, error.message);
      }
    }

    console.log('\n📊 ملخص العملية:');
    console.log(`  ✅ تم إنشاء: ${created} نوع جديد`);
    console.log(`  ℹ️  موجود مسبقاً: ${existing} نوع`);
    console.log(`  📋 المجموع: ${created + existing} نوع عقار`);

    // عرض جميع الأنواع المتاحة
    const allTypes = await PropertyType.findAll({
      where: { is_active: true },
      order: [['name_ar', 'ASC']]
    });

    console.log('\n🏠 أنواع العقارات المتاحة:');
    allTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type.name_ar} (${type.name_en}) - ${type.icon}`);
    });

    console.log('\n🎯 الخطوات التالية:');
    console.log('1. استخدم هذه الأنواع عند إنشاء عقارات جديدة');
    console.log('2. يمكن إضافة أنواع جديدة عبر API: POST /properties/types');
    console.log('3. قم بتحديث Postman Collection: npm run postman:update');

  } catch (error) {
    console.error('❌ خطأ في بذر أنواع العقارات:', error.message);
    throw error;
  }
}

// تشغيل البذر
if (require.main === module) {
  seedPropertyTypes()
    .then(() => {
      console.log('\n🏁 انتهى بذر أنواع العقارات بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('فشل في بذر أنواع العقارات:', error);
      process.exit(1);
    });
}

module.exports = { seedPropertyTypes };

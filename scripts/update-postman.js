const fs = require('fs');
const path = require('path');

/**
 * تحديث Postman Collection تلقائياً مع العقارات الجديدة
 */
async function updatePostmanCollection() {
  try {
    console.log('🔄 جاري تحديث Postman Collection...');
    
    const collectionPath = path.join(__dirname, '../docs/postman_collection.json');
    
    // قراءة الملف الحالي
    let collection;
    try {
      collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    } catch (error) {
      console.error('❌ خطأ في قراءة ملف Postman Collection:', error.message);
      return;
    }

    console.log('📋 Collection الحالي:', collection.info.name);
    console.log('📅 آخر تحديث:', new Date().toISOString());

    // تحديث معلومات Collection
    collection.info.version = "3.0.0";
    collection.info.description = "API للحجوزات مع نظام العقارات والمقدم - محدث تلقائياً";
    collection.info.name = "Room Booking API - Properties & Deposit System";

    // إضافة متغيرات جديدة
    const newVariables = [
      { "key": "property_id", "value": "" },
      { "key": "property_type_id", "value": "" },
      { "key": "media_id", "value": "" },
      { "key": "deposit_amount", "value": "" },
      { "key": "remaining_amount", "value": "" }
    ];

    // دمج المتغيرات الجديدة مع الموجودة
    const existingKeys = collection.variable.map(v => v.key);
    newVariables.forEach(newVar => {
      if (!existingKeys.includes(newVar.key)) {
        collection.variable.push(newVar);
      }
    });

    // إضافة قسم العقارات الجديد
    const propertiesSection = {
      "name": "🏠 Properties Management",
      "description": "إدارة العقارات والأنواع والوسائط مع نظام المقدم",
      "item": [
        {
          "name": "List Property Types",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/properties/types",
              "host": ["{{base_url}}"],
              "path": ["properties", "types"]
            }
          }
        },
        {
          "name": "Create Property Type (Admin)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const json = pm.response.json();",
                  "if (json.data && json.data.id) {",
                  "  pm.environment.set('property_type_id', json.data.id);",
                  "  console.log('Property type ID set:', json.data.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{admin_token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/properties/types",
              "host": ["{{base_url}}"],
              "path": ["properties", "types"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name_en\": \"Hotel\",\n  \"name_ar\": \"فندق\",\n  \"description_en\": \"Hotel rooms and suites\",\n  \"description_ar\": \"غرف وأجنحة فندقية\",\n  \"icon\": \"hotel\"\n}"
            }
          }
        },
        {
          "name": "List Properties",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/properties?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["properties"],
              "query": [
                { "key": "page", "value": "1" },
                { "key": "limit", "value": "10" },
                { "key": "type_id", "value": "{{property_type_id}}", "disabled": true },
                { "key": "location", "value": "الرياض", "disabled": true },
                { "key": "featured", "value": "true", "disabled": true }
              ]
            }
          }
        },
        {
          "name": "Create Property (Staff/Admin)",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const json = pm.response.json();",
                  "if (json.data && json.data.id) {",
                  "  pm.environment.set('property_id', json.data.id);",
                  "  pm.environment.set('deposit_amount', json.data.calculated_deposit);",
                  "  console.log('Property created with ID:', json.data.id);",
                  "  console.log('Deposit amount:', json.data.calculated_deposit);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Authorization", "value": "Bearer {{admin_token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/properties",
              "host": ["{{base_url}}"],
              "path": ["properties"]
            },
            "body": {
              "mode": "formdata",
              "formdata": [
                { "key": "name", "value": "شقة مفروشة بالرياض", "type": "text" },
                { "key": "description", "value": "شقة مفروشة بالكامل في حي الملز", "type": "text" },
                { "key": "type_id", "value": "{{property_type_id}}", "type": "text" },
                { "key": "location", "value": "الرياض", "type": "text" },
                { "key": "address", "value": "حي الملز، شارع الأمير محمد بن عبدالعزيز", "type": "text" },
                { "key": "full_price", "value": "500", "type": "text" },
                { "key": "deposit_type", "value": "percentage", "type": "text" },
                { "key": "deposit_value", "value": "30", "type": "text" },
                { "key": "capacity", "value": "4", "type": "text" },
                { "key": "bedrooms", "value": "2", "type": "text" },
                { "key": "bathrooms", "value": "1", "type": "text" },
                { "key": "amenities", "value": "[\"wifi\", \"parking\", \"kitchen\", \"ac\"]", "type": "text" }
              ]
            }
          }
        },
        {
          "name": "Get Property Details",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/properties/{{property_id}}",
              "host": ["{{base_url}}"],
              "path": ["properties", "{{property_id}}"]
            }
          }
        }
      ]
    };

    // إضافة قسم الحجز بالمقدم
    const propertyBookingSection = {
      "name": "🏛️ Property Booking with Deposit",
      "description": "حجز العقارات مع دفع مقدم",
      "item": [
        {
          "name": "Create Property Booking with Deposit",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const json = pm.response.json();",
                  "if (json.data && json.data.booking) {",
                  "  pm.environment.set('booking_id', json.data.booking.id);",
                  "  pm.environment.set('remaining_amount', json.data.payment_summary.remaining_amount);",
                  "  console.log('Property booking created:', json.data.booking.id);",
                  "  console.log('Deposit paid:', json.data.payment_summary.deposit_paid);",
                  "  console.log('Remaining amount:', json.data.payment_summary.remaining_amount);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{customer_token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/user/property-booking",
              "host": ["{{base_url}}"],
              "path": ["user", "property-booking"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"property_id\": {{property_id}},\n  \"check_in\": \"2024-08-15T15:00:00.000Z\",\n  \"check_out\": \"2024-08-17T12:00:00.000Z\",\n  \"guest_count\": 2,\n  \"payment_method\": \"mada\",\n  \"special_requests\": \"أريد غرفة بإطلالة جميلة\",\n  \"couponCode\": \"{{coupon_code}}\"\n}"
            }
          }
        },
        {
          "name": "Create Property Booking (No Coupon)",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" },
              { "key": "Authorization", "value": "Bearer {{customer_token}}" }
            ],
            "url": {
              "raw": "{{base_url}}/user/property-booking",
              "host": ["{{base_url}}"],
              "path": ["user", "property-booking"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"property_id\": {{property_id}},\n  \"check_in\": \"2024-08-20T15:00:00.000Z\",\n  \"check_out\": \"2024-08-22T12:00:00.000Z\",\n  \"guest_count\": 1,\n  \"payment_method\": \"visa\",\n  \"special_requests\": \"Late check-in please\"\n}"
            }
          }
        }
      ]
    };

    // البحث عن موقع إدراج الأقسام الجديدة
    let insertIndex = collection.item.findIndex(item => 
      item.name && item.name.includes('Customer Operations')
    );
    
    if (insertIndex === -1) {
      // إضافة في النهاية إذا لم نجد القسم المناسب
      collection.item.push(propertiesSection);
      collection.item.push(propertyBookingSection);
    } else {
      // إضافة قبل Customer Operations
      collection.item.splice(insertIndex, 0, propertiesSection);
      collection.item.splice(insertIndex + 1, 0, propertyBookingSection);
    }

    // حفظ الملف المحدث
    fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
    
    console.log('✅ تم تحديث Postman Collection بنجاح!');
    console.log('📊 الإحصائيات:');
    console.log(`  - أقسام Collection: ${collection.item.length}`);
    console.log(`  - متغيرات البيئة: ${collection.variable.length}`);
    console.log(`  - تاريخ التحديث: ${new Date().toLocaleString('ar-SA')}`);
    
    console.log('\n🔗 للاستخدام:');
    console.log('1. افتح Postman');
    console.log('2. استيراد الملف المحدث أو');
    console.log('3. استخدم الرابط المباشر إذا كان متاحاً');

  } catch (error) {
    console.error('❌ خطأ في تحديث Postman Collection:', error.message);
    console.error(error.stack);
  }
}

// تشغيل التحديث
if (require.main === module) {
  updatePostmanCollection();
}

module.exports = { updatePostmanCollection };

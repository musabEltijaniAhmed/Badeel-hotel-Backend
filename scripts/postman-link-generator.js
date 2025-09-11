const fs = require('fs');
const path = require('path');

/**
 * إنشاء رابط Postman مباشر للمشاركة
 */
function generatePostmanLink() {
  try {
    console.log('🔗 إنشاء رابط Postman مباشر...');
    
    const collectionPath = path.join(__dirname, '../docs/postman_collection.json');
    const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
    
    // ترميز الملف لـ Base64
    const base64Collection = Buffer.from(JSON.stringify(collection)).toString('base64');
    
    // إنشاء رابط مباشر
    const directLink = `https://www.postman.com/collections/import?data=${encodeURIComponent(base64Collection)}`;
    
    // إنشاء ملف HTML للمشاركة
    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Room Booking API - Postman Collection</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            text-align: center;
        }
        .logo {
            font-size: 3em;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background: #FF6C37;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #e55a2e;
        }
        .features {
            text-align: right;
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .features h3 {
            color: #333;
            margin-bottom: 15px;
        }
        .features ul {
            list-style-type: none;
            padding: 0;
        }
        .features li {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .features li:before {
            content: "✅ ";
            margin-left: 10px;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            color: #1976d2;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏠</div>
        <h1>Room Booking API</h1>
        <p class="subtitle">Properties & Deposit System - Postman Collection</p>
        
        <a href="${directLink}" class="btn" target="_blank">
            🚀 فتح في Postman
        </a>
        
        <a href="./postman_collection.json" class="btn" download style="background: #28a745;">
            💾 تحميل ملف JSON
        </a>
        
        <div class="features">
            <h3>🎯 المميزات المتاحة:</h3>
            <ul>
                <li>نظام إدارة العقارات الكامل</li>
                <li>حجز بنظام المقدم والمبلغ المتبقي</li>
                <li>دعم أنواع عقارات متعددة</li>
                <li>رفع وإدارة الوسائط (صور/فيديوهات)</li>
                <li>نظام كوبونات الخصم</li>
                <li>أدوار وصلاحيات متقدمة</li>
                <li>دفع عبر وسائل متعددة</li>
                <li>إشعارات SMS وFirebase</li>
            </ul>
        </div>
        
        <div class="info">
            <strong>📋 آخر تحديث:</strong> ${new Date().toLocaleString('ar-SA')}<br>
            <strong>🔢 الإصدار:</strong> ${collection.info.version}<br>
            <strong>📊 عدد الطلبات:</strong> ${countRequests(collection)} طلب
        </div>
    </div>
</body>
</html>`;

    // حفظ ملف HTML
    const htmlPath = path.join(__dirname, '../docs/postman-collection.html');
    fs.writeFileSync(htmlPath, htmlContent);
    
    // إنشاء ملف معلومات الروابط
    const linksInfo = {
      direct_import_link: directLink,
      json_file_path: "./docs/postman_collection.json",
      html_page: "./docs/postman-collection.html",
      collection_info: {
        name: collection.info.name,
        version: collection.info.version,
        description: collection.info.description,
        last_updated: new Date().toISOString(),
        total_requests: countRequests(collection),
        total_folders: collection.item.length,
        environment_variables: collection.variable.length
      },
      usage_instructions: {
        method_1: "انقر على الرابط المباشر لفتح Collection في Postman",
        method_2: "حمل ملف JSON واستورده يدوياً في Postman",
        method_3: "استخدم الرابط المحلي في Postman: File > Import > Link",
        auto_update: "للتحديث التلقائي: npm run postman:sync"
      }
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../docs/postman-links.json'),
      JSON.stringify(linksInfo, null, 2)
    );
    
    console.log('✅ تم إنشاء الروابط والملفات بنجاح!');
    console.log('\n🔗 الروابط المتاحة:');
    console.log(`📱 رابط مباشر: ${directLink.substring(0, 100)}...`);
    console.log(`📄 صفحة HTML: docs/postman-collection.html`);
    console.log(`📋 ملف JSON: docs/postman_collection.json`);
    console.log(`ℹ️  معلومات الروابط: docs/postman-links.json`);
    
    console.log('\n🎯 طرق الاستخدام:');
    console.log('1. انسخ الرابط المباشر وألصقه في متصفح');
    console.log('2. افتح ملف HTML في المتصفح للوصول السهل');
    console.log('3. شارك الرابط مع أعضاء الفريق');
    
    return {
      directLink,
      htmlPath,
      jsonPath: collectionPath
    };
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء رابط Postman:', error.message);
    throw error;
  }
}

// دالة مساعدة لعد الطلبات
function countRequests(collection, count = 0) {
  for (const item of collection.item) {
    if (item.request) {
      count++;
    } else if (item.item) {
      count = countRequests(item, count);
    }
  }
  return count;
}

// تشغيل الإنشاء
if (require.main === module) {
  generatePostmanLink();
}

module.exports = { generatePostmanLink };

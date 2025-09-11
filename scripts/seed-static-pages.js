const { StaticPage } = require('../models');
const logger = require('../utils/logger');

async function seedStaticPages() {
  try {
    logger.info('بدء إدراج البيانات الأولية للصفحات الثابتة...');

    // التحقق من وجود الصفحات
    const existingPages = await StaticPage.findAll();
    if (existingPages.length > 0) {
      logger.info('الصفحات الثابتة موجودة بالفعل، تخطي الإدراج');
      return;
    }

    // البيانات الأولية
    const pagesData = [
      {
        slug: 'about-us',
        title_ar: 'من نحن',
        title_en: 'About Us',
        content_ar: `
          <div class="about-us-content">
            <h1 class="text-3xl font-bold mb-6 text-center">مرحباً بكم في منصة حجز العقارات</h1>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">رؤيتنا</h2>
                <p class="text-gray-700 leading-relaxed">
                  نسعى لأن نكون المنصة الأولى في المملكة العربية السعودية لحجز العقارات السياحية 
                  والشقق المفروشة، مع توفير تجربة مستخدم استثنائية وخدمة عملاء متميزة.
                </p>
              </div>
              
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-green-600">مهمتنا</h2>
                <p class="text-gray-700 leading-relaxed">
                  تسهيل عملية البحث عن العقارات المناسبة وحجزها بكل سهولة وأمان، 
                  مع ضمان جودة الخدمات المقدمة ورضا العملاء.
                </p>
              </div>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 text-center">لماذا تختار منصتنا؟</h3>
              <ul class="space-y-3">
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>عقارات موثقة ومختارة بعناية</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>أسعار تنافسية وشفافة</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>دعم عملاء على مدار الساعة</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>حجز آمن وسهل الاستخدام</span>
                </li>
              </ul>
            </div>
          </div>
        `,
        content_en: `
          <div class="about-us-content">
            <h1 class="text-3xl font-bold mb-6 text-center">Welcome to Our Property Booking Platform</h1>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">Our Vision</h2>
                <p class="text-gray-700 leading-relaxed">
                  We strive to be the leading platform in Saudi Arabia for booking tourist properties 
                  and furnished apartments, providing an exceptional user experience and outstanding customer service.
                </p>
              </div>
              
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-green-600">Our Mission</h2>
                <p class="text-gray-700 leading-relaxed">
                  To simplify the process of finding and booking suitable properties with ease and security, 
                  while ensuring quality services and customer satisfaction.
                </p>
              </div>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-xl font-semibold mb-4 text-center">Why Choose Our Platform?</h3>
              <ul class="space-y-3">
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>Verified and carefully selected properties</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>Competitive and transparent pricing</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>24/7 customer support</span>
                </li>
                <li class="flex items-center">
                  <span class="text-green-500 mr-3">✓</span>
                  <span>Secure and easy-to-use booking</span>
                </li>
              </ul>
            </div>
          </div>
        `
      },
      {
        slug: 'privacy-policy',
        title_ar: 'سياسة الخصوصية',
        title_en: 'Privacy Policy',
        content_ar: `
          <div class="privacy-policy-content">
            <h1 class="text-3xl font-bold mb-6 text-center">سياسة الخصوصية</h1>
            
            <div class="space-y-6">
              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">مقدمة</h2>
                <p class="text-gray-700 leading-relaxed">
                  نحن في منصة حجز العقارات نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. 
                  تشرح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">البيانات التي نجمعها</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2">البيانات الشخصية:</h3>
                  <ul class="list-disc list-inside space-y-1 text-gray-700">
                    <li>الاسم الكامل</li>
                    <li>عنوان البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>عنوان السكن</li>
                    <li>معلومات الهوية</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">كيفية استخدام البيانات</h2>
                <p class="text-gray-700 leading-relaxed">
                  نستخدم بياناتك الشخصية لتقديم خدماتنا، بما في ذلك:
                </p>
                <ul class="list-disc list-inside mt-3 space-y-1 text-gray-700">
                  <li>معالجة الحجوزات والمدفوعات</li>
                  <li>التواصل معك بخصوص الحجوزات</li>
                  <li>تحسين خدماتنا وتجربة المستخدم</li>
                  <li>إرسال إشعارات مهمة</li>
                </ul>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">حماية البيانات</h2>
                <p class="text-gray-700 leading-relaxed">
                  نستخدم تقنيات تشفير متقدمة لحماية بياناتك الشخصية. 
                  لا نشارك بياناتك مع أي طرف ثالث دون موافقتك الصريحة، 
                  إلا في الحالات التي يقتضيها القانون.
                </p>
              </section>
            </div>
          </div>
        `,
        content_en: `
          <div class="privacy-policy-content">
            <h1 class="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
            
            <div class="space-y-6">
              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Introduction</h2>
                <p class="text-gray-700 leading-relaxed">
                  At our property booking platform, we respect your privacy and are committed to protecting your personal data. 
                  This policy explains how we collect, use, and protect your information when you use our platform.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Data We Collect</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2">Personal Data:</h3>
                  <ul class="list-disc list-inside space-y-1 text-gray-700">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Residential address</li>
                    <li>Identity information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">How We Use Your Data</h2>
                <p class="text-gray-700 leading-relaxed">
                  We use your personal data to provide our services, including:
                </p>
                <ul class="list-disc list-inside mt-3 space-y-1 text-gray-700">
                  <li>Processing bookings and payments</li>
                  <li>Communicating with you about bookings</li>
                  <li>Improving our services and user experience</li>
                  <li>Sending important notifications</li>
                </ul>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Data Protection</h2>
                <p class="text-gray-700 leading-relaxed">
                  We use advanced encryption technologies to protect your personal data. 
                  We do not share your data with any third party without your explicit consent, 
                  except in cases required by law.
                </p>
              </section>
            </div>
          </div>
        `
      },
      {
        slug: 'terms',
        title_ar: 'الشروط والأحكام',
        title_en: 'Terms and Conditions',
        content_ar: `
          <div class="terms-content">
            <h1 class="text-3xl font-bold mb-6 text-center">الشروط والأحكام</h1>
            
            <div class="space-y-6">
              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">قبول الشروط</h2>
                <p class="text-gray-700 leading-relaxed">
                  باستخدام منصة حجز العقارات، فإنك توافق على هذه الشروط والأحكام. 
                  إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام منصتنا.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">شروط الحجز</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2">عند الحجز، يجب عليك:</h3>
                  <ul class="list-disc list-inside space-y-1 text-gray-700">
                    <li>تقديم معلومات صحيحة ودقيقة</li>
                    <li>الالتزام بسياسات الإلغاء</li>
                    <li>احترام قواعد العقار</li>
                    <li>دفع الرسوم المطلوبة في الوقت المحدد</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">سياسة الإلغاء</h2>
                <p class="text-gray-700 leading-relaxed">
                  يمكن إلغاء الحجز قبل 24 ساعة من تاريخ الوصول دون أي رسوم. 
                  الإلغاء في وقت أقرب قد يخضع لرسوم إلغاء حسب سياسة العقار.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">المسؤولية</h2>
                <p class="text-gray-700 leading-relaxed">
                  نحن نعمل كوسيط بينك وبين مالكي العقارات. 
                  لا نتحمل المسؤولية عن أي خسائر أو أضرار تحدث أثناء إقامتك.
                </p>
              </section>
            </div>
          </div>
        `,
        content_en: `
          <div class="terms-content">
            <h1 class="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>
            
            <div class="space-y-6">
              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Acceptance of Terms</h2>
                <p class="text-gray-700 leading-relaxed">
                  By using our property booking platform, you agree to these terms and conditions. 
                  If you do not agree to any part of these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Booking Terms</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="font-semibold mb-2">When booking, you must:</h3>
                  <ul class="list-disc list-inside space-y-1 text-gray-700">
                    <li>Provide accurate and correct information</li>
                    <li>Comply with cancellation policies</li>
                    <li>Respect property rules</li>
                    <li>Pay required fees on time</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Cancellation Policy</h2>
                <p class="text-gray-700 leading-relaxed">
                  Bookings can be cancelled up to 24 hours before arrival without any fees. 
                  Cancellation closer to arrival may be subject to cancellation fees according to property policy.
                </p>
              </section>

              <section>
                <h2 class="text-2xl font-semibold mb-3 text-blue-600">Liability</h2>
                <p class="text-gray-700 leading-relaxed">
                  We act as an intermediary between you and property owners. 
                  We are not responsible for any losses or damages that occur during your stay.
                </p>
              </section>
            </div>
          </div>
        `
      },
      {
        slug: 'contact',
        title_ar: 'تواصل معنا',
        title_en: 'Contact Us',
        content_ar: `
          <div class="contact-content">
            <h1 class="text-3xl font-bold mb-6 text-center">تواصل معنا</h1>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">معلومات التواصل</h2>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <div class="bg-blue-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">الهاتف</p>
                      <a href="tel:+966501234567" class="text-blue-600 hover:text-blue-800">+966 50 123 4567</a>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="bg-green-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">واتساب</p>
                      <a href="https://wa.me/966501234567" target="_blank" class="text-green-600 hover:text-green-800">+966 50 123 4567</a>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="bg-red-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">البريد الإلكتروني</p>
                      <a href="mailto:info@example.com" class="text-red-600 hover:text-red-800">info@example.com</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">ساعات العمل</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span>الأحد - الخميس:</span>
                      <span class="font-semibold">8:00 ص - 6:00 م</span>
                    </div>
                    <div class="flex justify-between">
                      <span>الجمعة:</span>
                      <span class="font-semibold">9:00 ص - 2:00 م</span>
                    </div>
                    <div class="flex justify-between">
                      <span>السبت:</span>
                      <span class="font-semibold">9:00 ص - 5:00 م</span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6">
                  <h3 class="text-lg font-semibold mb-3">العنوان</h3>
                  <p class="text-gray-700">
                    الرياض، المملكة العربية السعودية<br>
                    برج المملكة، الطابق 15
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 p-6 rounded-lg text-center">
              <h3 class="text-xl font-semibold mb-3">هل تحتاج مساعدة؟</h3>
              <p class="text-gray-700 mb-4">
                فريق دعم العملاء لدينا متاح على مدار الساعة لمساعدتك في أي استفسار
              </p>
              <a href="https://wa.me/966501234567" target="_blank" 
                 class="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                تواصل معنا عبر واتساب
              </a>
            </div>
          </div>
        `,
        content_en: `
          <div class="contact-content">
            <h1 class="text-3xl font-bold mb-6 text-center">Contact Us</h1>
            
            <div class="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">Contact Information</h2>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <div class="bg-blue-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">Phone</p>
                      <a href="tel:+966501234567" class="text-blue-600 hover:text-blue-800">+966 50 123 4567</a>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="bg-green-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">WhatsApp</p>
                      <a href="https://wa.me/966501234567" target="_blank" class="text-green-600 hover:text-green-800">+966 50 123 4567</a>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <div class="bg-red-100 p-3 rounded-full mr-4">
                      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-semibold">Email</p>
                      <a href="mailto:info@example.com" class="text-gray-600 hover:text-gray-800">info@example.com</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 class="text-2xl font-semibold mb-4 text-blue-600">Working Hours</h2>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span>Sunday - Thursday:</span>
                      <span class="font-semibold">8:00 AM - 6:00 PM</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Friday:</span>
                      <span class="font-semibold">9:00 AM - 2:00 PM</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Saturday:</span>
                      <span class="font-semibold">9:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>
                
                <div class="mt-6">
                  <h3 class="text-lg font-semibold mb-3">Address</h3>
                  <p class="text-gray-700">
                    Riyadh, Saudi Arabia<br>
                    Kingdom Tower, 15th Floor
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 p-6 rounded-lg text-center">
              <h3 class="text-xl font-semibold mb-3">Need Help?</h3>
              <p class="text-gray-700 mb-4">
                Our customer support team is available 24/7 to help you with any inquiries
              </p>
              <a href="https://wa.me/966501234567" target="_blank" 
                 class="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Contact us via WhatsApp
              </a>
            </div>
          </div>
        `
      }
    ];

    // إدراج البيانات
    for (const pageData of pagesData) {
      await StaticPage.create(pageData);
      logger.info(`تم إنشاء الصفحة: ${pageData.slug}`);
    }

    logger.info('تم إدراج جميع الصفحات الثابتة بنجاح!');
    
    // عرض الصفحات المنشأة
    const createdPages = await StaticPage.findAll();
    logger.info(`إجمالي الصفحات: ${createdPages.length}`);
    createdPages.forEach(page => {
      logger.info(`- ${page.slug}: ${page.title_ar} / ${page.title_en}`);
    });

  } catch (error) {
    logger.error('خطأ في إدراج الصفحات الثابتة:', error);
    throw error;
  }
}

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  seedStaticPages()
    .then(() => {
      logger.info('تم الانتهاء من إدراج الصفحات الثابتة');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('فشل في إدراج الصفحات الثابتة:', error);
      process.exit(1);
    });
}

module.exports = seedStaticPages;

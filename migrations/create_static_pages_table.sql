-- إنشاء جدول الصفحات الثابتة
CREATE TABLE IF NOT EXISTS `static_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `title_ar` varchar(255) NOT NULL,
  `title_en` varchar(255) NOT NULL,
  `content_ar` text NOT NULL,
  `content_en` text NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `static_pages_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج البيانات الأولية
INSERT INTO `static_pages` (`slug`, `title_ar`, `title_en`, `content_ar`, `content_en`, `updated_by`) VALUES
('about-us', 'من نحن', 'About Us', '<h2>مرحباً بكم في منصة حجز العقارات</h2><p>نحن منصة رائدة في مجال حجز العقارات السياحية والشقق المفروشة في المملكة العربية السعودية.</p>', '<h2>Welcome to Our Property Booking Platform</h2><p>We are a leading platform for booking tourist properties and furnished apartments in Saudi Arabia.</p>', NULL),
('privacy-policy', 'سياسة الخصوصية', 'Privacy Policy', '<h2>سياسة الخصوصية</h2><p>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً لأحدث المعايير الدولية.</p>', '<h2>Privacy Policy</h2><p>We respect your privacy and are committed to protecting your personal data according to the latest international standards.</p>', NULL),
('terms', 'الشروط والأحكام', 'Terms and Conditions', '<h2>الشروط والأحكام</h2><p>باستخدام هذه المنصة، فإنك توافق على الشروط والأحكام المذكورة أدناه.</p>', '<h2>Terms and Conditions</h2><p>By using this platform, you agree to the terms and conditions stated below.</p>', NULL),
('contact', 'تواصل معنا', 'Contact Us', '<h2>تواصل معنا</h2><p>نحن هنا لمساعدتك! يمكنك التواصل معنا عبر:</p><ul><li>الهاتف: +966-XX-XXXXXXX</li><li>البريد الإلكتروني: info@example.com</li><li>واتساب: +966-XX-XXXXXXX</li></ul>', '<h2>Contact Us</h2><p>We are here to help! You can contact us via:</p><ul><li>Phone: +966-XX-XXXXXXX</li><li>Email: info@example.com</li><li>WhatsApp: +966-XX-XXXXXXX</li></ul>', NULL);

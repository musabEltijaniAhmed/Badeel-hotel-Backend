-- إضافة الحقول الجديدة لجدول الكوبونات
ALTER TABLE Coupons ADD COLUMN used_count INTEGER DEFAULT 0 NOT NULL;

-- إضافة الحقول الجديدة لجدول الحجوزات
ALTER TABLE Bookings ADD COLUMN couponCode VARCHAR(255);
ALTER TABLE Bookings ADD COLUMN originalAmount FLOAT;
ALTER TABLE Bookings ADD COLUMN discountAmount FLOAT DEFAULT 0;
ALTER TABLE Bookings ADD COLUMN finalAmount FLOAT;

-- تحديث البيانات الموجودة
UPDATE Coupons SET used_count = 0 WHERE used_count IS NULL;
UPDATE Bookings SET discountAmount = 0 WHERE discountAmount IS NULL;

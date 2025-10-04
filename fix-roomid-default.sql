-- إصلاح عمود roomId في جدول Bookings
-- إضافة قيمة افتراضية NULL للعمود

ALTER TABLE `Bookings` 
MODIFY COLUMN `roomId` VARCHAR(36) NULL DEFAULT NULL;

-- التحقق من التغيير
DESCRIBE `Bookings`;

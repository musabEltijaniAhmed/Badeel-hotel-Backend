-- إنشاء جدول التقييمات
CREATE TABLE "Reviews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookingId" UUID NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    media JSONB DEFAULT '[]',
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- القيود
    CONSTRAINT "fk_reviews_booking" FOREIGN KEY ("bookingId") REFERENCES "Bookings"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_reviews_property" FOREIGN KEY ("propertyId") REFERENCES "Properties"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_reviews_user" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unique_booking_review" UNIQUE ("bookingId")
);

-- إضافة تعليقات على الجدول
COMMENT ON TABLE "Reviews" IS 'جدول تقييمات العقارات من قبل المستخدمين';
COMMENT ON COLUMN "Reviews".id IS 'المفتاح الأساسي';
COMMENT ON COLUMN "Reviews"."bookingId" IS 'معرف الحجز المرتبط';
COMMENT ON COLUMN "Reviews"."propertyId" IS 'معرف العقار المرتبط';
COMMENT ON COLUMN "Reviews"."userId" IS 'معرف المستخدم صاحب التقييم';
COMMENT ON COLUMN "Reviews".rating IS 'التقييم من 1 إلى 5 نجوم';
COMMENT ON COLUMN "Reviews".comment IS 'نص التعليق (اختياري)';
COMMENT ON COLUMN "Reviews".media IS 'مصفوفة روابط الصور والفيديو';
COMMENT ON COLUMN "Reviews"."isApproved" IS 'هل التقييم معتمد من الإدارة';
COMMENT ON COLUMN "Reviews"."isFlagged" IS 'هل التقييم محدد للمراجعة';
COMMENT ON COLUMN "Reviews"."adminNotes" IS 'ملاحظات الإدارة على التقييم';
COMMENT ON COLUMN "Reviews"."createdAt" IS 'تاريخ الإنشاء';
COMMENT ON COLUMN "Reviews"."updatedAt" IS 'تاريخ التحديث';

-- إنشاء الفهارس
CREATE UNIQUE INDEX "idx_reviews_booking_unique" ON "Reviews" ("bookingId");
CREATE INDEX "idx_reviews_property" ON "Reviews" ("propertyId");
CREATE INDEX "idx_reviews_user" ON "Reviews" ("userId");
CREATE INDEX "idx_reviews_rating" ON "Reviews" (rating);
CREATE INDEX "idx_reviews_approved" ON "Reviews" ("isApproved");
CREATE INDEX "idx_reviews_created" ON "Reviews" ("createdAt");

-- إضافة تعليقات على الفهارس
COMMENT ON INDEX "idx_reviews_booking_unique" IS 'فهرس فريد: كل حجز يسمح بتقييم واحد فقط';
COMMENT ON INDEX "idx_reviews_property" IS 'فهرس العقار';
COMMENT ON INDEX "idx_reviews_user" IS 'فهرس المستخدم';
COMMENT ON INDEX "idx_reviews_rating" IS 'فهرس التقييم';
COMMENT ON INDEX "idx_reviews_approved" IS 'فهرس حالة الاعتماد';
COMMENT ON INDEX "idx_reviews_created" IS 'فهرس تاريخ الإنشاء';

-- إنشاء دالة تحديث متوسط التقييم للعقار
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث متوسط التقييم وعدد التقييمات للعقار
    UPDATE "Properties"
    SET 
        rating = (
            SELECT COALESCE(AVG(r.rating), 0)
            FROM "Reviews" r
            WHERE r."propertyId" = NEW."propertyId"
            AND r."isApproved" = true
        ),
        "reviews_count" = (
            SELECT COUNT(*)
            FROM "Reviews" r
            WHERE r."propertyId" = NEW."propertyId"
            AND r."isApproved" = true
        )
    WHERE id = NEW."propertyId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Triggers لتحديث متوسط التقييم تلقائياً
CREATE TRIGGER trigger_update_property_rating_insert
    AFTER INSERT ON "Reviews"
    FOR EACH ROW
    EXECUTE FUNCTION update_property_rating();

CREATE TRIGGER trigger_update_property_rating_update
    AFTER UPDATE ON "Reviews"
    FOR EACH ROW
    WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD."isApproved" IS DISTINCT FROM NEW."isApproved")
    EXECUTE FUNCTION update_property_rating();

CREATE TRIGGER trigger_update_property_rating_delete
    AFTER DELETE ON "Reviews"
    FOR EACH ROW
    EXECUTE FUNCTION update_property_rating();

-- إنشاء دالة للتحقق من صحة التقييم
CREATE OR REPLACE FUNCTION validate_review()
RETURNS TRIGGER AS $$
BEGIN
    -- التحقق من أن الحجز مكتمل
    IF NOT EXISTS (
        SELECT 1 FROM "Bookings" 
        WHERE id = NEW."bookingId" 
        AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'لا يمكن التقييم إلا بعد انتهاء الإقامة';
    END IF;
    
    -- التحقق من أن المستخدم هو صاحب الحجز
    IF NOT EXISTS (
        SELECT 1 FROM "Bookings" 
        WHERE id = NEW."bookingId" 
        AND "userId" = NEW."userId"
    ) THEN
        RAISE EXCEPTION 'غير مصرح لك بتقييم هذا الحجز';
    END IF;
    
    -- التحقق من عدم وجود تقييم سابق
    IF EXISTS (
        SELECT 1 FROM "Reviews" 
        WHERE "bookingId" = NEW."bookingId"
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'تم التقييم مسبقاً لهذا الحجز';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger للتحقق من صحة التقييم
CREATE TRIGGER trigger_validate_review
    BEFORE INSERT OR UPDATE ON "Reviews"
    FOR EACH ROW
    EXECUTE FUNCTION validate_review();

-- إنشاء View لعرض التقييمات مع معلومات إضافية
CREATE VIEW "ReviewsWithDetails" AS
SELECT 
    r.id,
    r.rating,
    r.comment,
    r.media,
    r."isApproved",
    r."isFlagged",
    r."createdAt",
    r."updatedAt",
    b.id as "bookingId",
    b."startDate",
    b."endDate",
    b.status as "bookingStatus",
    p.id as "propertyId",
    p.name as "propertyName",
    p.location as "propertyLocation",
    u.id as "userId",
    u."firstName",
    u."lastName",
    u.avatar as "userAvatar"
FROM "Reviews" r
JOIN "Bookings" b ON r."bookingId" = b.id
JOIN "Properties" p ON r."propertyId" = p.id
JOIN "Users" u ON r."userId" = u.id
WHERE r."isApproved" = true
ORDER BY r."createdAt" DESC;

-- إضافة تعليق على View
COMMENT ON VIEW "ReviewsWithDetails" IS 'عرض التقييمات مع معلومات الحجز والعقار والمستخدم';

-- إنشاء View لإحصائيات التقييم
CREATE VIEW "ReviewStats" AS
SELECT 
    p.id as "propertyId",
    p.name as "propertyName",
    COUNT(r.id) as "totalReviews",
    COALESCE(AVG(r.rating), 0) as "averageRating",
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as "fiveStarCount",
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) as "fourStarCount",
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) as "threeStarCount",
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) as "twoStarCount",
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) as "oneStarCount"
FROM "Properties" p
LEFT JOIN "Reviews" r ON p.id = r."propertyId" AND r."isApproved" = true
GROUP BY p.id, p.name
ORDER BY "averageRating" DESC, "totalReviews" DESC;

-- إضافة تعليق على View
COMMENT ON VIEW "ReviewStats" IS 'إحصائيات التقييم للعقارات';

const { Review, Booking, Property, User, Notification } = require('../models');
const { sendPushNotification } = require('../utils/fcm.service');
const { sendSMS } = require('../utils/sms.service');
const { sendEmail } = require('../utils/email.service');
const logger = require('../utils/logger');

class ReviewController {
  /**
   * إنشاء تقييم جديد
   */
  static async createReview(req, res) {
    try {
      const { bookingId, rating, comment, media } = req.body;
      const userId = req.user.id;

      // التحقق من وجود الحجز
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'الحجز غير موجود'
        });
      }

      // التحقق من أن المستخدم هو صاحب الحجز
      if (booking.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتقييم هذا الحجز'
        });
      }

      // التحقق من أن الحجز مكتمل
      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن التقييم إلا بعد انتهاء الإقامة'
        });
      }

      // التحقق من عدم وجود تقييم سابق
      const existingReview = await Review.findOne({
        where: { bookingId }
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'تم التقييم مسبقاً لهذا الحجز'
        });
      }

      // التحقق من تاريخ المغادرة
      const today = new Date();
      const checkoutDate = new Date(booking.endDate);
      
      if (today < checkoutDate) {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن التقييم إلا بعد تاريخ المغادرة'
        });
      }

      // إنشاء التقييم
      const review = await Review.create({
        bookingId,
        propertyId: booking.PropertyBooking.id,
        userId,
        rating,
        comment: comment || null,
        media: media || [],
        isApproved: true, // التقييمات معتمدة افتراضياً
        isFlagged: false
      });

      // إرسال إشعار للمدير
      await this.notifyAdmin(review, booking);

      // تحديث متوسط التقييم للعقار (يتم تلقائياً عبر hooks)

      logger.info(`Review created successfully for booking ${bookingId} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'تم إضافة التقييم بنجاح',
        data: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          media: review.media,
          createdAt: review.createdAt
        }
      });

    } catch (error) {
      logger.error('Error creating review:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إنشاء التقييم',
        error: error.message
      });
    }
  }

  /**
   * الحصول على تقييمات العقار
   */
  static async getPropertyReviews(req, res) {
    try {
      const { propertyId } = req.params;
      const { page = 1, limit = 10, rating } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {
        propertyId,
        isApproved: true
      };

      if (rating) {
        whereClause.rating = parseInt(rating);
      }

      const reviews = await Review.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'avatar']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          reviews: reviews.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(reviews.count / limit),
            totalItems: reviews.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching property reviews:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب التقييمات',
        error: error.message
      });
    }
  }

  /**
   * الحصول على تقييمات المستخدم
   */
  static async getUserReviews(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const reviews = await Review.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Property,
            as: 'Property',
            attributes: ['id', 'name', 'location', 'image']
          },
          {
            model: Booking,
            as: 'Booking',
            attributes: ['id', 'startDate', 'endDate', 'status']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          reviews: reviews.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(reviews.count / limit),
            totalItems: reviews.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error fetching user reviews:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب تقييماتك',
        error: error.message
      });
      }
  }

  /**
   * تحديث التقييم
   */
  static async updateReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { rating, comment, media } = req.body;
      const userId = req.user.id;

      const review = await Review.findByPk(reviewId, {
        include: [
          { model: Booking, as: 'Booking' },
          { model: Property, as: 'Property' }
        ]
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'التقييم غير موجود'
        });
      }

      if (review.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتعديل هذا التقييم'
        });
      }

      // التحقق من أن الحجز مكتمل
      if (review.Booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن تعديل التقييم إلا بعد انتهاء الإقامة'
        });
      }

      // تحديث التقييم
      await review.update({
        rating: rating || review.rating,
        comment: comment !== undefined ? comment : review.comment,
        media: media || review.media
      });

      logger.info(`Review ${reviewId} updated successfully by user ${userId}`);

      res.json({
        success: true,
        message: 'تم تحديث التقييم بنجاح',
        data: review
      });

    } catch (error) {
      logger.error('Error updating review:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تحديث التقييم',
        error: error.message
      });
    }
  }

  /**
   * حذف التقييم
   */
  static async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findByPk(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'التقييم غير موجود'
        });
      }

      if (review.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بحذف هذا التقييم'
        });
      }

      await review.destroy();

      logger.info(`Review ${reviewId} deleted successfully by user ${userId}`);

      res.json({
        success: true,
        message: 'تم حذف التقييم بنجاح'
      });

    } catch (error) {
      logger.error('Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء حذف التقييم',
        error: error.message
      });
    }
  }

  /**
   * الحصول على إحصائيات التقييم
   */
  static async getReviewStats(req, res) {
    try {
      const { propertyId } = req.params;

      const stats = await Review.findAll({
        where: {
          propertyId,
          isApproved: true
        },
        attributes: [
          'rating',
          [sequelize.fn('COUNT', sequelize.col('rating')), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'ASC']]
      });

      const totalReviews = stats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0);
      const averageRating = stats.reduce((sum, stat) => {
        return sum + (stat.rating * parseInt(stat.dataValues.count));
      }, 0) / totalReviews;

      res.json({
        success: true,
        data: {
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(2)) || 0,
          ratingDistribution: stats.map(stat => ({
            rating: stat.rating,
            count: parseInt(stat.dataValues.count),
            percentage: parseFloat(((parseInt(stat.dataValues.count) / totalReviews) * 100).toFixed(1))
          }))
        }
      });

    } catch (error) {
      logger.error('Error fetching review stats:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب إحصائيات التقييم',
        error: error.message
      });
    }
  }

  /**
   * إرسال دعوة تقييم
   */
  static async sendReviewInvitation(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;

      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'الحجز غير موجود'
        });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بإرسال دعوة تقييم لهذا الحجز'
        });
      }

      // التحقق من أن الحجز مكتمل
      if (booking.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن إرسال دعوة تقييم إلا بعد انتهاء الإقامة'
        });
      }

      // إرسال إشعار push
      await sendPushNotification(
        booking.User.fcmToken,
        'كيف كانت تجربتك؟',
        'قيّم إقامتك الآن وشاركنا رأيك',
        {
          type: 'review_invitation',
          bookingId: booking.id,
          propertyId: booking.property_id
        }
      );

      // إرسال SMS
      if (booking.User.phone) {
        await sendSMS(
          booking.User.phone,
          `كيف كانت تجربتك في ${booking.Property.name}؟ قيّم إقامتك الآن: ${process.env.APP_URL}/review/${booking.id}`
        );
      }

      // إرسال Email
      if (booking.User.email) {
        await sendEmail(
          booking.User.email,
          'قيّم إقامتك',
          'review-invitation',
          {
            userName: `${booking.User.firstName} ${booking.User.lastName}`,
            propertyName: booking.Property.name,
            reviewUrl: `${process.env.APP_URL}/review/${booking.id}`
          }
        );
      }

      logger.info(`Review invitation sent for booking ${bookingId}`);

      res.json({
        success: true,
        message: 'تم إرسال دعوة التقييم بنجاح'
      });

    } catch (error) {
      logger.error('Error sending review invitation:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء إرسال دعوة التقييم',
        error: error.message
      });
    }
  }

  /**
   * إشعار المدير بتقييم جديد
   */
  static async notifyAdmin(review, booking) {
    try {
      // إنشاء إشعار في قاعدة البيانات
      await Notification.create({
        userId: booking.Property.created_by,
        title: 'تقييم جديد',
        message: `تم إضافة تقييم جديد لعقارك "${booking.Property.name}"`,
        type: 'new_review',
        data: {
          reviewId: review.id,
          propertyId: review.propertyId,
          rating: review.rating,
          comment: review.comment
        },
        isRead: false
      });

      // إرسال إشعار push للمدير
      const admin = await User.findByPk(booking.Property.created_by);
      if (admin && admin.fcmToken) {
        await sendPushNotification(
          admin.fcmToken,
          'تقييم جديد',
          `تم إضافة تقييم جديد لعقارك "${booking.Property.name}"`,
          {
            type: 'new_review',
            reviewId: review.id,
            propertyId: review.propertyId
          }
        );
      }

    } catch (error) {
      logger.error('Error notifying admin:', error);
    }
  }

  /**
   * جدولة إرسال دعوات التقييم
   */
  static async scheduleReviewInvitations() {
    try {
      const today = new Date();
      
      // البحث عن الحجوزات المكتملة التي انتهت اليوم
      const completedBookings = await Booking.findAll({
        where: {
          status: 'completed',
          endDate: today.toISOString().split('T')[0]
        },
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      for (const booking of completedBookings) {
        // التحقق من عدم وجود تقييم
        const existingReview = await Review.findOne({
          where: { bookingId: booking.id }
        });

        if (!existingReview) {
          // إرسال دعوة تقييم
          await this.sendReviewInvitation({
            params: { bookingId: booking.id },
            user: { id: booking.userId }
          }, { json: () => {} });
        }
      }

      logger.info(`Scheduled review invitations sent for ${completedBookings.length} bookings`);

    } catch (error) {
      logger.error('Error scheduling review invitations:', error);
    }
  }
}

module.exports = ReviewController;

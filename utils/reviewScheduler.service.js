const cron = require('node-cron');
const { Review, Booking, Property, User } = require('../models');
const { sendPushNotification } = require('./fcm.service');
const { sendSMS } = require('./sms.service');
const { sendEmail } = require('./email.service');
const logger = require('./logger');

class ReviewSchedulerService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * بدء خدمة جدولة دعوات التقييم
   */
  start() {
    if (this.isRunning) {
      logger.warn('Review scheduler is already running');
      return;
    }

    // جدولة إرسال دعوات التقييم يومياً في الساعة 10:00 صباحاً
    cron.schedule('0 10 * * *', async () => {
      await this.sendDailyReviewInvitations();
    }, {
      timezone: 'Asia/Riyadh'
    });

    // جدولة إرسال تذكيرات التقييم كل يومين
    cron.schedule('0 14 * * *', async () => {
      await this.sendReviewReminders();
    }, {
      timezone: 'Asia/Riyadh'
    });

    // جدولة تحديث حالة الحجوزات إلى مكتمل
    cron.schedule('0 0 * * *', async () => {
      await this.updateCompletedBookings();
    }, {
      timezone: 'Asia/Riyadh'
    });

    this.isRunning = true;
    logger.info('Review scheduler started successfully');
  }

  /**
   * إرسال دعوات التقييم اليومية
   */
  async sendDailyReviewInvitations() {
    try {
      logger.info('Starting daily review invitations...');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // البحث عن الحجوزات المكتملة التي انتهت أمس
      const completedBookings = await Booking.findAll({
        where: {
          status: 'completed',
          endDate: yesterday.toISOString().split('T')[0]
        },
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      let invitationsSent = 0;
      let errors = 0;

      for (const booking of completedBookings) {
        try {
          // التحقق من عدم وجود تقييم
          const existingReview = await Review.findOne({
            where: { bookingId: booking.id }
          });

          if (!existingReview) {
            await this.sendReviewInvitation(booking);
            invitationsSent++;
            
            // تأخير قصير لتجنب إرسال الكثير من الإشعارات دفعة واحدة
            await this.delay(1000);
          }
        } catch (error) {
          logger.error(`Error sending review invitation for booking ${booking.id}:`, error);
          errors++;
        }
      }

      logger.info(`Daily review invitations completed. Sent: ${invitationsSent}, Errors: ${errors}`);

    } catch (error) {
      logger.error('Error in daily review invitations:', error);
    }
  }

  /**
   * إرسال تذكيرات التقييم
   */
  async sendReviewReminders() {
    try {
      logger.info('Starting review reminders...');
      
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // البحث عن الحجوزات المكتملة التي انتهت منذ 3 أيام ولم يتم تقييمها
      const bookingsWithoutReviews = await Booking.findAll({
        where: {
          status: 'completed',
          endDate: threeDaysAgo.toISOString().split('T')[0]
        },
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      let remindersSent = 0;
      let errors = 0;

      for (const booking of bookingsWithoutReviews) {
        try {
          // التحقق من عدم وجود تقييم
          const existingReview = await Review.findOne({
            where: { bookingId: booking.id }
          });

          if (!existingReview) {
            await this.sendReviewReminder(booking);
            remindersSent++;
            
            await this.delay(1000);
          }
        } catch (error) {
          logger.error(`Error sending review reminder for booking ${booking.id}:`, error);
          errors++;
        }
      }

      logger.info(`Review reminders completed. Sent: ${remindersSent}, Errors: ${errors}`);

    } catch (error) {
      logger.error('Error in review reminders:', error);
    }
  }

  /**
   * تحديث حالة الحجوزات إلى مكتمل
   */
  async updateCompletedBookings() {
    try {
      logger.info('Starting to update completed bookings...');
      
      const today = new Date();
      
      // البحث عن الحجوزات المؤكدة التي انتهت اليوم
      const expiredBookings = await Booking.findAll({
        where: {
          status: 'confirmed',
          endDate: {
            [require('sequelize').Op.lt]: today.toISOString().split('T')[0]
          }
        }
      });

      let updated = 0;
      let errors = 0;

      for (const booking of expiredBookings) {
        try {
          await booking.update({ status: 'completed' });
          updated++;
        } catch (error) {
          logger.error(`Error updating booking ${booking.id}:`, error);
          errors++;
        }
      }

      logger.info(`Completed bookings update finished. Updated: ${updated}, Errors: ${errors}`);

    } catch (error) {
      logger.error('Error updating completed bookings:', error);
    }
  }

  /**
   * إرسال دعوة تقييم
   */
  async sendReviewInvitation(booking) {
    try {
      const { User, Property } = booking;

      // إرسال إشعار push
      if (User.fcmToken) {
        await sendPushNotification(
          User.fcmToken,
          'كيف كانت تجربتك؟',
          `قيّم إقامتك في ${Property.name} وشاركنا رأيك`,
          {
            type: 'review_invitation',
            bookingId: booking.id,
            propertyId: Property.id,
            propertyName: Property.name
          }
        );
      }

      // إرسال SMS
      if (User.phone) {
        await sendSMS(
          User.phone,
          `كيف كانت تجربتك في ${Property.name}؟ قيّم إقامتك الآن: ${process.env.APP_URL}/review/${booking.id}`
        );
      }

      // إرسال Email
      if (User.email) {
        await sendEmail(
          User.email,
          'قيّم إقامتك',
          'review-invitation',
          {
            userName: `${User.firstName} ${User.lastName}`,
            propertyName: Property.name,
            reviewUrl: `${process.env.APP_URL}/review/${booking.id}`,
            checkOutDate: booking.endDate
          }
        );
      }

      logger.info(`Review invitation sent for booking ${booking.id}`);

    } catch (error) {
      logger.error(`Error sending review invitation for booking ${booking.id}:`, error);
      throw error;
    }
  }

  /**
   * إرسال تذكير تقييم
   */
  async sendReviewReminder(booking) {
    try {
      const { User, Property } = booking;

      // إرسال إشعار push
      if (User.fcmToken) {
        await sendPushNotification(
          User.fcmToken,
          'تذكير: قيّم إقامتك',
          `لا تنس تقييم إقامتك في ${Property.name}`,
          {
            type: 'review_reminder',
            bookingId: booking.id,
            propertyId: Property.id,
            propertyName: Property.name
          }
        );
      }

      // إرسال SMS
      if (User.phone) {
        await sendSMS(
          User.phone,
          `تذكير: لا تنس تقييم إقامتك في ${Property.name}. رابط التقييم: ${process.env.APP_URL}/review/${booking.id}`
        );
      }

      // إرسال Email
      if (User.email) {
        await sendEmail(
          User.email,
          'تذكير: قيّم إقامتك',
          'review-reminder',
          {
            userName: `${User.firstName} ${User.lastName}`,
            propertyName: Property.name,
            reviewUrl: `${process.env.APP_URL}/review/${booking.id}`,
            checkOutDate: booking.endDate
          }
        );
      }

      logger.info(`Review reminder sent for booking ${booking.id}`);

    } catch (error) {
      logger.error(`Error sending review reminder for booking ${booking.id}:`, error);
      throw error;
    }
  }

  /**
   * إرسال دعوة تقييم فورية
   */
  async sendImmediateReviewInvitation(bookingId) {
    try {
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Property, as: 'Property' },
          { model: User, as: 'User' }
        ]
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'completed') {
        throw new Error('Booking is not completed');
      }

      await this.sendReviewInvitation(booking);
      return true;

    } catch (error) {
      logger.error(`Error sending immediate review invitation for booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * إيقاف خدمة الجدولة
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Review scheduler is not running');
      return;
    }

    cron.getTasks().forEach(task => task.destroy());
    this.isRunning = false;
    logger.info('Review scheduler stopped');
  }

  /**
   * تأخير قصير
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * الحصول على حالة الخدمة
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.getNextRunTime()
    };
  }

  /**
   * الحصول على وقت التشغيل التالي
   */
  getNextRunTime() {
    const now = new Date();
    const nextInvitation = new Date(now);
    nextInvitation.setHours(10, 0, 0, 0);
    
    if (nextInvitation <= now) {
      nextInvitation.setDate(nextInvitation.getDate() + 1);
    }

    const nextReminder = new Date(now);
    nextReminder.setHours(14, 0, 0, 0);
    
    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    return {
      nextInvitation: nextInvitation.toISOString(),
      nextReminder: nextReminder.toISOString()
    };
  }
}

module.exports = new ReviewSchedulerService();

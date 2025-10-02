const { Room, Booking, Review, Notification, Property, PropertyType, PropertyMedia, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { sendNotification } = require('../utils/fcm.service');
const { sendSMS } = require('../utils/sms.service');
const socket = require('../utils/socket');
const { charge } = require('../utils/payment.service');
const { validateAndApplyCoupon, incrementCouponUsage } = require('./coupon.controller');

exports.listRooms = async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;
    const rooms = await Room.findAll({ where });
    return res.success(rooms, 'ROOMS_LISTED');
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate, couponCode } = req.body;
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'ROOM_NOT_FOUND' });
    if (!room.available) return res.status(400).json({ message: 'ROOM_NOT_AVAILABLE' });

    // حساب السعر الأساسي للحجز
    const originalAmount = room.price;
    let finalAmount = originalAmount;
    let discountAmount = 0;
    let couponValidation = null;
    let usedCouponId = null;

    // التحقق من الكوبون إذا تم تقديمه
    if (couponCode) {
      couponValidation = await validateAndApplyCoupon(couponCode, originalAmount);
      
      if (!couponValidation.isValid) {
        return res.status(400).json({
          message: 'INVALID_COUPON',
          error: couponValidation.error,
          details: couponValidation.message
        });
      }

      // تطبيق الخصم
      finalAmount = couponValidation.finalAmount;
      discountAmount = couponValidation.discountAmount;
      usedCouponId = couponValidation.couponId;
    }

    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      startDate,
      endDate,
      status: 'confirmed',
      couponCode: couponCode || null,
      originalAmount,
      discountAmount,
      finalAmount,
    });

    // زيادة عدد مرات استخدام الكوبون إذا تم استخدامه
    if (usedCouponId) {
      await incrementCouponUsage(usedCouponId);
    }

    // Mark room unavailable (simplified)
    await room.update({ available: false });

    // Create notification
    const notificationMessage = couponCode 
      ? `تم تأكيد حجزك لـ ${room.name} بخصم ${discountAmount}. السعر النهائي: ${finalAmount}`
      : `تم تأكيد حجزك لـ ${room.name}`;

    await Notification.create({
      userId: req.user.id,
      title: 'Booking Confirmed',
      body: notificationMessage,
      type: 'booking',
    });

    // Send push & SMS
    if (req.user.fcmToken) {
      sendNotification(req.user.fcmToken, {
        notification: { title: 'Booking Confirmed', body: notificationMessage },
      });
    }
    if (req.user.phone) {
      const smsMessage = couponCode 
        ? `تم تأكيد حجزك لـ ${room.name} من ${startDate} إلى ${endDate}. السعر بعد الخصم: ${finalAmount}`
        : `تم تأكيد حجزك لـ ${room.name} من ${startDate} إلى ${endDate}`;
      sendSMS(req.user.phone, smsMessage);
    }

    // الدفع بالسعر النهائي (بعد الخصم)
    await charge({ 
      amount: finalAmount * 100, 
      source: req.body.paymentMethodId, 
      description: `Booking ${booking.id}${couponCode ? ` with coupon ${couponCode}` : ''}` 
    });
    
    socket.emit('booking:created', { 
      bookingId: booking.id, 
      userId: req.user.id,
      finalAmount,
      discountAmount,
      couponUsed: !!couponCode
    });

    // إرجاع تفاصيل الحجز مع معلومات الخصم
    const response = {
      ...booking.toJSON(),
      couponApplied: !!couponCode,
      ...(couponValidation && { 
        couponDetails: {
          type: couponValidation.couponType,
          value: couponValidation.couponValue,
          discountAmount: couponValidation.discountAmount
        }
      })
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking) return res.status(404).json({ message: 'BOOKING_NOT_FOUND' });
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findOne({ where: { id: bookingId, userId: req.user.id } });
    if (!booking) return res.status(404).json({ message: 'BOOKING_NOT_FOUND' });

    const review = await Review.create({ bookingId, userId: req.user.id, rating, comment });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const list = await Notification.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification statistics for admin
 */
/**
 * Send notification to specific users (Admin only)
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { users, title, body, data = {}, channels = ['push'] } = req.body;
    const adminId = req.user.id;

    // Validate users array
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and must not be empty',
        error: 'INVALID_USERS'
      });
    }

    // Get users with their FCM tokens
    const targetUsers = await User.findAll({
      where: {
        id: { [Op.in]: users },
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'phone', 'fcmToken']
    });

    if (targetUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active users found',
        error: 'USERS_NOT_FOUND'
      });
    }

    // Send notifications through selected channels
    const results = await Promise.allSettled(targetUsers.map(async (user) => {
      // Create notification record
      const notification = await Notification.create({
        userId: user.id,
        title,
        body,
        data,
        type: data.type || 'admin',
        read: false,
        created_by: adminId
      });

      const channelResults = {
        notification_id: notification.id,
        user_id: user.id,
        channels: {}
      };

      // Send through each selected channel
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'push':
              if (user.fcmToken) {
                await sendNotification(user.fcmToken, {
                  notification: { title, body },
                  data: { ...data, notification_id: notification.id }
                });
                channelResults.channels.push = 'success';
              } else {
                channelResults.channels.push = 'no_token';
              }
              break;

            case 'sms':
              if (user.phone) {
                await sendSMS(user.phone, body);
                channelResults.channels.sms = 'success';
              } else {
                channelResults.channels.sms = 'no_phone';
              }
              break;

            case 'email':
              if (user.email) {
                // Assuming you have an email service
                // await sendEmail(user.email, title, body);
                channelResults.channels.email = 'success';
              } else {
                channelResults.channels.email = 'no_email';
              }
              break;
          }
        } catch (error) {
          channelResults.channels[channel] = 'failed';
          logger.error(`Failed to send ${channel} notification to user ${user.id}: %o`, error);
        }
      }

      return channelResults;
    }));

    // Count successes and failures
    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.success++;
        acc.details.push(result.value);
      } else {
        acc.failed++;
        acc.errors.push(result.reason.message);
      }
      return acc;
    }, { success: 0, failed: 0, details: [], errors: [] });

    res.json({
      success: true,
      message: 'Notifications sent',
      data: {
        total_users: targetUsers.length,
        successful_sends: summary.success,
        failed_sends: summary.failed,
        delivery_details: summary.details,
        errors: summary.errors
      }
    });

  } catch (error) {
    logger.error('Error sending notifications: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};

exports.getNotificationStats = async (req, res, next) => {
  try {
    const { start_date, end_date, type } = req.query;
    const where = {};

    // Add date filters if provided
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    // Add type filter if provided
    if (type) where.type = type;

    // Get total count
    const totalCount = await Notification.count({ where });

    // Get count by type
    const typeStats = await Notification.findAll({
      where,
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    // Get read/unread stats
    const readStats = await Notification.findAll({
      where,
      attributes: [
        'read',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['read']
    });

    // Get daily stats for the period
    const dailyStats = await Notification.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        by_type: typeStats.reduce((acc, stat) => {
          acc[stat.type] = parseInt(stat.get('count'));
          return acc;
        }, {}),
        by_status: {
          read: parseInt(readStats.find(s => s.read)?.get('count') || 0),
          unread: parseInt(readStats.find(s => !s.read)?.get('count') || 0)
        },
        daily_stats: dailyStats.map(stat => ({
          date: stat.get('date'),
          count: parseInt(stat.get('count'))
        }))
      }
    });

  } catch (error) {
    logger.error('Error getting notification stats: %o', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, orderAmount } = req.body;
    
    const validation = await validateAndApplyCoupon(couponCode, orderAmount);
    
    if (!validation.isValid) {
      return res.status(400).json({
        valid: false,
        error: validation.error,
        message: validation.message
      });
    }

    res.json({
      valid: true,
      couponCode,
      originalAmount: validation.originalAmount,
      discountAmount: validation.discountAmount,
      finalAmount: validation.finalAmount,
      couponType: validation.couponType,
      couponValue: validation.couponValue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء حجز جديد للعقارات مع دعم المقدم
 */
exports.createPropertyBooking = async (req, res, next) => {
  try {
    const {
      property_id,
      check_in,
      check_out,
      guest_count,
      payment_method,
      special_requests,
      couponCode
    } = req.body;

    // التحقق من العقار
    const property = await Property.findOne({
      where: { 
        id: property_id, 
        is_active: true, 
        is_available: true 
      },
      include: [
        { 
          model: PropertyType, 
          as: 'PropertyType',
          attributes: ['name_ar', 'name_en']
        },
        {
          model: PropertyMedia,
          as: 'Media',
          where: { is_primary: true },
          required: false,
          attributes: ['url', 'alt_text']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        message: 'PROPERTY_NOT_FOUND_OR_UNAVAILABLE'
      });
    }

    // التحقق من السعة
    if (guest_count > property.capacity) {
      return res.status(400).json({
        status: false,
        message: 'GUEST_COUNT_EXCEEDS_CAPACITY',
        data: {
          requested: guest_count,
          max_capacity: property.capacity
        }
      });
    }

    // حساب التواريخ والمدة
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const daysDiff = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) {
      return res.status(400).json({
        status: false,
        message: 'INVALID_DATE_RANGE'
      });
    }

    // حساب السعر الأساسي
    const totalPrice = property.full_price * daysDiff;
    let finalAmount = totalPrice;
    let discountAmount = 0;
    let couponValidation = null;
    let usedCouponId = null;

    // التحقق من الكوبون إذا تم تقديمه
    if (couponCode) {
      couponValidation = await validateAndApplyCoupon(couponCode, totalPrice);
      
      if (!couponValidation.isValid) {
        return res.status(400).json({
          status: false,
          message: 'INVALID_COUPON',
          error: couponValidation.error,
          details: couponValidation.message
        });
      }

      // تطبيق الخصم
      finalAmount = couponValidation.finalAmount;
      discountAmount = couponValidation.discountAmount;
      usedCouponId = couponValidation.couponId;
    }

    // حساب المقدم المطلوب
    const depositAmount = property.calculated_deposit;
    
    // التحقق من صحة المقدم
    if (depositAmount > finalAmount) {
      return res.status(400).json({
        status: false,
        message: 'DEPOSIT_EXCEEDS_TOTAL_AMOUNT',
        data: {
          deposit_required: depositAmount,
          total_amount: finalAmount
        }
      });
    }

    // حساب المبلغ المتبقي
    const remainingAmount = finalAmount - depositAmount;

    // إنشاء الحجز
    const booking = await Booking.create({
      userId: req.user.id,
      property_id,
      check_in: checkInDate,
      check_out: checkOutDate,
      guest_count,
      payment_method,
      special_requests,
      
      // تفاصيل المبالغ
      total_price: totalPrice,
      deposit_amount: depositAmount,
      deposit_paid: 0, // سيتم تحديثه بعد الدفع
      remaining_amount: remainingAmount,
      
      // تفاصيل الكوبون
      couponCode: couponCode || null,
      originalAmount: totalPrice,
      discountAmount,
      finalAmount,
      
      // حالات الحجز والدفع
      status: 'pending',
      payment_status: 'pending'
    });

    // محاكاة عملية الدفع للمقدم
    try {
      const paymentResult = await charge({
        amount: depositAmount,
        currency: 'SAR',
        description: `مقدم حجز العقار ${property.name}`,
        metadata: {
          booking_id: booking.id,
          user_id: req.user.id,
          property_id: property.id,
          payment_type: 'deposit'
        }
      });

      if (paymentResult.success) {
        // تحديث الحجز بعد نجاح الدفع
        await booking.update({
          deposit_paid: depositAmount,
          payment_status: 'partial',
          status: 'confirmed',
          payment_reference: paymentResult.transaction_id
        });

        // تحديث عدد استخدام الكوبون
        if (usedCouponId) {
          await incrementCouponUsage(usedCouponId);
        }

        // إرسال إشعارات
        await Promise.all([
          // إشعار للمستخدم
          sendNotification(req.user.id, {
            title: 'تم تأكيد الحجز',
            body: `تم تأكيد حجزك في ${property.name}. المتبقي: ${remainingAmount} ريال`,
            data: { booking_id: booking.id, type: 'booking_confirmed' }
          }),
          
          // رسالة SMS
          sendSMS(req.user.phone, 
            `تم تأكيد حجزك في ${property.name}. تم دفع مقدم ${depositAmount} ريال. المتبقي ${remainingAmount} ريال عند الوصول.`
          )
        ]);

        // جلب الحجز مع تفاصيله الكاملة للإرجاع
        const completeBooking = await Booking.findByPk(booking.id, {
          include: [
            {
              model: Property,
              as: 'Property',
              include: [
                { model: PropertyType, as: 'PropertyType' },
                { 
                  model: PropertyMedia, 
                  as: 'Media',
                  where: { is_primary: true },
                  required: false
                }
              ]
            }
          ]
        });

        return res.status(201).json({
          status: true,
          message: 'تم إنشاء الحجز وتأكيد دفع المقدم بنجاح',
          data: {
            booking: completeBooking,
            payment_summary: {
              total_amount: finalAmount,
              deposit_paid: depositAmount,
              remaining_amount: remainingAmount,
              payment_method: payment_method,
              transaction_id: paymentResult.transaction_id
            },
            next_steps: {
              message: 'يرجى تجهيز المبلغ المتبقي عند الوصول',
              check_in_time: property.check_in_time,
              contact_info: 'سيتم التواصل معك قبل موعد الوصول'
            }
          }
        });

      } else {
        // فشل الدفع
        await booking.update({
          status: 'cancelled',
          payment_status: 'pending',
          notes: `فشل دفع المقدم: ${paymentResult.error}`
        });

        return res.status(400).json({
          status: false,
          message: 'PAYMENT_FAILED',
          error: paymentResult.error,
          data: {
            booking_id: booking.id,
            amount_attempted: depositAmount
          }
        });
      }

    } catch (paymentError) {
      // خطأ في عملية الدفع
      await booking.update({
        status: 'cancelled',
        payment_status: 'pending',
        notes: `خطأ في عملية الدفع: ${paymentError.message}`
      });

      return res.status(500).json({
        status: false,
        message: 'PAYMENT_PROCESSING_ERROR',
        error: paymentError.message
      });
    }

  } catch (error) {
    next(error);
  }
}; 
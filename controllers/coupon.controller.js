const { Coupon } = require('../models');    
const { Op } = require('sequelize');


exports.createCoupon = async (req, res, next) => {
    try {
      const coupon = await Coupon.create(req.body);
      res.status(201).json({
        status: true,
        message: 'تم إنشاء الكوبون بنجاح',
        data: coupon
      });
    } catch (error) {
      next(error);
    }
  };
  
  exports.listCoupons = async (req, res, next) => {
    try {
      const coupons = await Coupon.findAll();
      res.status(200).json({
        success: true,
        data: coupons,
        message: 'COUPONS_LISTED_SUCCESSFULLY'
      });
    } catch (error) {
      next(error);
    }
  };
  
  exports.updateCoupon = async (req, res, next) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) return res.status(404).json({ message: 'COUPON_NOT_FOUND' });
      await coupon.update(req.body);
      res.success(coupon);
    } catch (error) {
      next(error);
    }
  };
  
  exports.deleteCoupon = async (req, res, next) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) return res.status(404).json({ message: 'COUPON_NOT_FOUND' });
      await coupon.destroy();
      res.success({ message: 'DELETED' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * التحقق من صحة الكوبون وحساب الخصم
   * @param {string} couponCode - كود الكوبون
   * @param {number} orderAmount - قيمة الطلب
   * @returns {Object} - نتيجة التحقق مع السعر النهائي
   */
  exports.validateAndApplyCoupon = async (couponCode, orderAmount) => {
    try {
      // البحث عن الكوبون بالكود
      const coupon = await Coupon.findOne({ where: { code: couponCode } });
      
      if (!coupon) {
        return {
          isValid: false,
          error: 'COUPON_NOT_FOUND',
          message: 'كود الكوبون غير صحيح'
        };
      }

      // التحقق من حالة الكوبون
      if (coupon.status !== 'active') {
        return {
          isValid: false,
          error: 'COUPON_INACTIVE',
          message: 'الكوبون غير نشط'
        };
      }

      // التحقق من التاريخ
      const currentDate = new Date();
      const startDate = new Date(coupon.start_date);
      const endDate = new Date(coupon.end_date);

      if (currentDate < startDate || currentDate > endDate) {
        return {
          isValid: false,
          error: 'COUPON_EXPIRED',
          message: 'الكوبون منتهي الصلاحية أو لم يبدأ بعد'
        };
      }

      // التحقق من الحد الأدنى لقيمة الطلب
      if (orderAmount < coupon.min_order_amount) {
        return {
          isValid: false,
          error: 'MIN_ORDER_NOT_MET',
          message: `الحد الأدنى للطلب هو ${coupon.min_order_amount}`
        };
      }

      // التحقق من عدد مرات الاستخدام
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return {
          isValid: false,
          error: 'USAGE_LIMIT_EXCEEDED',
          message: 'تم تجاوز الحد الأقصى لاستخدام الكوبون'
        };
      }

      // حساب قيمة الخصم
      let discountAmount = 0;
      if (coupon.type === 'percentage') {
        discountAmount = (orderAmount * coupon.value) / 100;
      } else if (coupon.type === 'fixed_amount') {
        discountAmount = coupon.value;
      }

      // التأكد من أن الخصم لا يتجاوز قيمة الطلب
      discountAmount = Math.min(discountAmount, orderAmount);

      const finalAmount = orderAmount - discountAmount;

      return {
        isValid: true,
        couponId: coupon.id,
        discountAmount,
        finalAmount,
        originalAmount: orderAmount,
        couponType: coupon.type,
        couponValue: coupon.value
      };

    } catch (error) {
      throw error;
    }
  };

  /**
   * زيادة عدد مرات استخدام الكوبون
   * @param {number} couponId - معرف الكوبون
   */
  exports.incrementCouponUsage = async (couponId) => {
    try {
      await Coupon.increment('used_count', { where: { id: couponId } });
    } catch (error) {
      throw error;
    }
  };
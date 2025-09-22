const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bookings',
        key: 'id'
      },
      comment: 'معرف الحجز المرتبط',
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id'
      },
      comment: 'معرف العقار المرتبط',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'معرف المستخدم صاحب التقييم',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { 
        min: 1, 
        max: 5,
        isInt: true
      },
      comment: 'التقييم من 1 إلى 5 نجوم',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'نص التعليق (اختياري)',
    },
    media: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'مصفوفة روابط الصور والفيديو',
      defaultValue: [],
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'هل التقييم معتمد من الإدارة',
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'هل التقييم محدد للمراجعة',
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'ملاحظات الإدارة على التقييم',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Reviews',
    indexes: [
      {
        fields: ['bookingId'],
        unique: true,
        comment: 'كل حجز يسمح بتقييم واحد فقط'
      },
      {
        fields: ['propertyId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['isApproved']
      },
      {
        fields: ['createdAt']
      }
    ],
    hooks: {
      beforeValidate: (review) => {
        // التأكد من أن media هو مصفوفة
        if (review.media && !Array.isArray(review.media)) {
          review.media = [];
        }
      },
      afterCreate: async (review, options) => {
        // تحديث متوسط التقييم للعقار
        const { Property } = require('./index');
        try {
          await updatePropertyRating(review.propertyId);
        } catch (error) {
          console.error('Error updating property rating:', error);
        }
      },
      afterUpdate: async (review, options) => {
        // تحديث متوسط التقييم للعقار عند تعديل التقييم
        if (review.changed('rating')) {
          const { Property } = require('./index');
          try {
            await updatePropertyRating(review.propertyId);
          } catch (error) {
            console.error('Error updating property rating:', error);
          }
        }
      },
      afterDestroy: async (review, options) => {
        // تحديث متوسط التقييم للعقار عند حذف التقييم
        const { Property } = require('./index');
        try {
          await updatePropertyRating(review.propertyId);
        } catch (error) {
          console.error('Error updating property rating:', error);
        }
      }
    }
  });

  // دالة تحديث متوسط التقييم للعقار
  async function updatePropertyRating(propertyId) {
    const { Review, Property } = require('./index');
    
    const reviews = await Review.findAll({
      where: {
        propertyId,
        isApproved: true
      },
      attributes: ['rating']
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Property.update({
        rating: parseFloat(averageRating.toFixed(2)),
        reviews_count: reviews.length
      }, {
        where: { id: propertyId }
      });
    } else {
      await Property.update({
        rating: 0.00,
        reviews_count: 0
      }, {
        where: { id: propertyId }
      });
    }
  }

  return Review;
}; 
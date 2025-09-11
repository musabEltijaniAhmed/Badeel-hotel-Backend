'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      bookingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'معرف الحجز المرتبط'
      },
      propertyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'معرف العقار المرتبط'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'معرف المستخدم صاحب التقييم'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
        comment: 'التقييم من 1 إلى 5 نجوم'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'نص التعليق (اختياري)'
      },
      media: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'مصفوفة روابط الصور والفيديو'
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'هل التقييم معتمد من الإدارة'
      },
      isFlagged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'هل التقييم محدد للمراجعة'
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'ملاحظات الإدارة على التقييم'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // إنشاء الفهارس
    await queryInterface.addIndex('Reviews', ['bookingId'], {
      unique: true,
      comment: 'كل حجز يسمح بتقييم واحد فقط'
    });

    await queryInterface.addIndex('Reviews', ['propertyId'], {
      comment: 'فهرس العقار'
    });

    await queryInterface.addIndex('Reviews', ['userId'], {
      comment: 'فهرس المستخدم'
    });

    await queryInterface.addIndex('Reviews', ['rating'], {
      comment: 'فهرس التقييم'
    });

    await queryInterface.addIndex('Reviews', ['isApproved'], {
      comment: 'فهرس حالة الاعتماد'
    });

    await queryInterface.addIndex('Reviews', ['createdAt'], {
      comment: 'فهرس تاريخ الإنشاء'
    });

    // إضافة تعليقات على الجدول
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE "Reviews" IS 'جدول تقييمات العقارات من قبل المستخدمين';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reviews');
  }
};

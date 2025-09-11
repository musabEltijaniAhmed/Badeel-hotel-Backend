'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // إضافة الحقول الجديدة لجدول الكوبونات
    await queryInterface.addColumn('Coupons', 'used_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // إضافة الحقول الجديدة لجدول الحجوزات
    await queryInterface.addColumn('Bookings', 'couponCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Bookings', 'originalAmount', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('Bookings', 'discountAmount', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Bookings', 'finalAmount', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // إزالة الحقول من جدول الكوبونات
    await queryInterface.removeColumn('Coupons', 'used_count');

    // إزالة الحقول من جدول الحجوزات
    await queryInterface.removeColumn('Bookings', 'couponCode');
    await queryInterface.removeColumn('Bookings', 'originalAmount');
    await queryInterface.removeColumn('Bookings', 'discountAmount');
    await queryInterface.removeColumn('Bookings', 'finalAmount');
  }
};

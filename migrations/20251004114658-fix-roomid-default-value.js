'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // إصلاح عمود roomId في جدول Bookings - إضافة قيمة افتراضية
    await queryInterface.changeColumn('Bookings', 'roomId', {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    // إزالة القيمة الافتراضية (العودة للحالة السابقة)
    await queryInterface.changeColumn('Bookings', 'roomId', {
      type: Sequelize.UUID,
      allowNull: true
    });
  }
};

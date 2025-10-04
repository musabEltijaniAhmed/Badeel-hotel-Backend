'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // إضافة قيمة افتراضية لعمود roomId
    await queryInterface.changeColumn('Bookings', 'roomId', {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // إزالة القيمة الافتراضية (العودة للحالة السابقة)
    await queryInterface.changeColumn('Bookings', 'roomId', {
      type: Sequelize.UUID,
      allowNull: true
    });
  }
};

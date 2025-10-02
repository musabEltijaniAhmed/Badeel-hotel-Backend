'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add token field
    await queryInterface.addColumn('Users', 'token', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
      after: 'password'
    });

    // Add language field
    await queryInterface.addColumn('Users', 'language', {
      type: Sequelize.ENUM('en', 'ar'),
      defaultValue: 'en',
      after: 'phone'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'token');
    await queryInterface.removeColumn('Users', 'language');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_Users_language;');
  }
};

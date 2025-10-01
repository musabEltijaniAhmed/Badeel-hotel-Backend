'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First remove the existing foreign key
    await queryInterface.removeConstraint('static_pages', 'static_pages_ibfk_1');

    // Then add the new foreign key referencing Users table
    await queryInterface.addConstraint('static_pages', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'static_pages_updated_by_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // First remove the new foreign key
    await queryInterface.removeConstraint('static_pages', 'static_pages_updated_by_fkey');

    // Then add back the original foreign key referencing Admins table
    await queryInterface.addConstraint('static_pages', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'static_pages_ibfk_1',
      references: {
        table: 'Admins',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};

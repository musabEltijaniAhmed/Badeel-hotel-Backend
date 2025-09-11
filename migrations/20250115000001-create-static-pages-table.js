'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('static_pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      title_ar: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      title_en: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content_ar: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      content_en: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // إضافة فهارس
    await queryInterface.addIndex('static_pages', ['slug']);
    await queryInterface.addIndex('static_pages', ['updated_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('static_pages');
  }
};

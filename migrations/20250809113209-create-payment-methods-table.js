'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_methods', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      provider_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provider_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'blocked'),
        defaultValue: 'active',
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      public_key: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      secret_key: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      merchant_id: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      callback_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for provider_code
    await queryInterface.addIndex('payment_methods', ['provider_code'], {
      unique: true,
      name: 'payment_methods_provider_code_unique'
    });

    // Add index for status to optimize filtering
    await queryInterface.addIndex('payment_methods', ['status'], {
      name: 'payment_methods_status_idx'
    });

    // Add index for display_order to optimize sorting
    await queryInterface.addIndex('payment_methods', ['display_order'], {
      name: 'payment_methods_display_order_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_methods');
  }
};

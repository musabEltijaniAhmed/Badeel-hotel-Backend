'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('system_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      group: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'e.g., sms, firebase, email, general'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_encrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the value should be encrypted (for sensitive data like API keys)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this setting is currently active'
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Add indexes
    await queryInterface.addIndex('system_settings', ['group'], {
      name: 'idx_system_settings_group'
    });
    await queryInterface.addIndex('system_settings', ['is_active'], {
      name: 'idx_system_settings_active'
    });

    // Insert default settings
    await queryInterface.bulkInsert('system_settings', [
      // SMS Settings
      {
        id: Sequelize.literal('UUID()'),
        key: 'sms_provider_name',
        value: 'Unifonic',
        group: 'sms',
        description: 'SMS Provider Name',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'sms_api_key',
        value: null,
        group: 'sms',
        description: 'SMS Provider API Key',
        is_encrypted: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'sms_sender_id',
        value: 'YourApp',
        group: 'sms',
        description: 'SMS Sender ID',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'sms_enabled',
        value: 'true',
        group: 'sms',
        description: 'Enable/Disable SMS Sending',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Firebase Settings
      {
        id: Sequelize.literal('UUID()'),
        key: 'firebase_server_key',
        value: null,
        group: 'firebase',
        description: 'Firebase Server Key',
        is_encrypted: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'firebase_project_id',
        value: null,
        group: 'firebase',
        description: 'Firebase Project ID',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'firebase_client_email',
        value: null,
        group: 'firebase',
        description: 'Firebase Client Email',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'firebase_private_key',
        value: null,
        group: 'firebase',
        description: 'Firebase Private Key',
        is_encrypted: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'push_notifications_enabled',
        value: 'true',
        group: 'firebase',
        description: 'Enable/Disable Push Notifications',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Email Settings
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_host',
        value: null,
        group: 'email',
        description: 'SMTP Host',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_port',
        value: '587',
        group: 'email',
        description: 'SMTP Port',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_user',
        value: null,
        group: 'email',
        description: 'SMTP Username',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_password',
        value: null,
        group: 'email',
        description: 'SMTP Password',
        is_encrypted: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_from_email',
        value: null,
        group: 'email',
        description: 'From Email Address',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'smtp_from_name',
        value: null,
        group: 'email',
        description: 'From Name',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'email_enabled',
        value: 'true',
        group: 'email',
        description: 'Enable/Disable Email Sending',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // General Settings
      {
        id: Sequelize.literal('UUID()'),
        key: 'app_name',
        value: 'Your App Name',
        group: 'general',
        description: 'Application Name',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'app_url',
        value: null,
        group: 'general',
        description: 'Application URL',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'support_email',
        value: null,
        group: 'general',
        description: 'Support Email Address',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'support_phone',
        value: null,
        group: 'general',
        description: 'Support Phone Number',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        key: 'maintenance_mode',
        value: 'false',
        group: 'general',
        description: 'Enable/Disable Maintenance Mode',
        is_encrypted: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('system_settings');
  }
};

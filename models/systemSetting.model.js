'use strict';

const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class SystemSetting extends Model {
    static associate(models) {
      SystemSetting.belongsTo(models.User, {
        foreignKey: 'updated_by',
        as: 'Updater'
      });
    }

    // Encrypt sensitive values
    static encryptValue(value) {
      if (!value) return null;
      const key = process.env.ENCRYPTION_KEY || 'your-encryption-key';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    }

    // Decrypt sensitive values
    static decryptValue(encrypted) {
      if (!encrypted) return null;
      const key = process.env.ENCRYPTION_KEY || 'your-encryption-key';
      const [ivHex, encryptedHex] = encrypted.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // Convert to JSON for API responses
    toJSON() {
      const values = { ...this.get() };
      if (values.is_encrypted) {
        values.value = '******'; // Hide encrypted values
      } else if (values.value) {
        values.value = values.is_encrypted ? SystemSetting.decryptValue(values.value) : values.value;
      }
      return values;
    }
  }

  SystemSetting.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Setting key is required' }
      }
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Setting group is required' },
        isIn: {
          args: [['sms', 'firebase', 'email', 'general']],
          msg: 'Invalid setting group'
        }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SystemSetting',
    tableName: 'system_settings',
    underscored: true,
    timestamps: true
  });

  return SystemSetting;
};

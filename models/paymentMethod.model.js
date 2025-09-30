'use strict';

const { Model } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PaymentMethod extends Model {
    static associate(models) {
      // Define associations here if needed in the future
      // For example, with transactions or payment logs
    }

    // Instance method to get public attributes (for client-side)
    toPublicJSON() {
      const { id, provider_name, provider_code, image_url, description, status, display_order } = this.get();
      return { id, provider_name, provider_code, image_url, description, status, display_order };
    }

    // Instance method to get admin attributes (includes sensitive data)
    toAdminJSON() {
      return this.get();
    }
  }

  PaymentMethod.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Provider name is required' }
      }
    },
    provider_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Provider code must be unique' },
      validate: {
        notEmpty: { msg: 'Provider code is required' },
        isUppercase: { msg: 'Provider code must be uppercase' }
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: { msg: 'Image URL must be a valid URL' }
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked'),
      defaultValue: 'active',
      allowNull: false,
      validate: {
        isIn: {
          args: [['active', 'blocked']],
          msg: 'Status must be either active or blocked'
        }
      }
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        isInt: { msg: 'Display order must be an integer' },
        min: { args: [0], msg: 'Display order must be non-negative' }
      }
    },
    public_key: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: 'Public key cannot be empty if provided' }
      }
    },
    secret_key: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: 'Secret key cannot be empty if provided' }
      }
    },
    merchant_id: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: { msg: 'Merchant ID cannot be empty if provided' }
      }
    },
    callback_url: {
      type: DataTypes.TEXT,
      validate: {
        isUrl: { msg: 'Callback URL must be a valid URL' }
      }
    }
  }, {
    sequelize,
    modelName: 'PaymentMethod',
    tableName: 'payment_methods',
    underscored: true,
    timestamps: true
  });

  return PaymentMethod;
};

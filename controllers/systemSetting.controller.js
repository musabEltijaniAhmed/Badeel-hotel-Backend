'use strict';

const { SystemSetting, User } = require('../models');
const logger = require('../utils/logger');

class SystemSettingController {
  /**
   * Get all settings (grouped)
   */
  async getAllSettings(req, res) {
    try {
      const settings = await SystemSetting.findAll({
        include: [{
          model: User,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }],
        order: [['group', 'ASC'], ['key', 'ASC']]
      });

      // Group settings by their group
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = [];
        }
        acc[setting.group].push(setting);
        return acc;
      }, {});

      res.json({
        success: true,
        message: 'Settings retrieved successfully',
        data: groupedSettings
      });

    } catch (error) {
      logger.error('Error fetching settings: %o', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error.message
      });
    }
  }

  /**
   * Get settings by group
   */
  async getSettingsByGroup(req, res) {
    try {
      const { group } = req.params;

      const settings = await SystemSetting.findAll({
        where: { group },
        include: [{
          model: User,
          as: 'Updater',
          attributes: ['id', 'name', 'email']
        }],
        order: [['key', 'ASC']]
      });

      res.json({
        success: true,
        message: `${group} settings retrieved successfully`,
        data: settings
      });

    } catch (error) {
      logger.error('Error fetching settings by group: %o', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error.message
      });
    }
  }

  /**
   * Update settings
   */
  async updateSettings(req, res) {
    try {
      const { settings } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(settings)) {
        return res.status(400).json({
          success: false,
          message: 'Settings must be an array',
          error: 'Invalid input format'
        });
      }

      const results = await Promise.all(settings.map(async ({ key, value, is_active }) => {
        const setting = await SystemSetting.findOne({ where: { key } });
        
        if (!setting) {
          return {
            key,
            status: 'error',
            message: 'Setting not found'
          };
        }

        const newValue = setting.is_encrypted ? SystemSetting.encryptValue(value) : value;
        await setting.update({
          value: newValue,
          is_active: typeof is_active === 'boolean' ? is_active : setting.is_active,
          updated_by: userId
        });

        return {
          key,
          status: 'success',
          message: 'Updated successfully'
        };
      }));

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: results
      });

    } catch (error) {
      logger.error('Error updating settings: %o', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error.message
      });
    }
  }

  /**
   * Toggle setting status
   */
  /**
   * Create new setting
   */
  async createSetting(req, res) {
    try {
      const { key, value, group, description, is_encrypted = false } = req.body;
      const userId = req.user.id;

      // Check if setting with this key already exists
      const existingSetting = await SystemSetting.findOne({ where: { key } });
      if (existingSetting) {
        return res.status(400).json({
          success: false,
          message: 'Setting with this key already exists',
          error: 'Duplicate key'
        });
      }

      // Create the setting
      const setting = await SystemSetting.create({
        key,
        value: is_encrypted ? SystemSetting.encryptValue(value) : value,
        group,
        description,
        is_encrypted,
        is_active: true,
        updated_by: userId
      });

      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting
      });

    } catch (error) {
      logger.error('Error creating setting: %o', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create setting',
        error: error.message
      });
    }
  }

  /**
   * Toggle setting status
   */
  async toggleSetting(req, res) {
    try {
      const { key } = req.params;
      const userId = req.user.id;

      const setting = await SystemSetting.findOne({ where: { key } });
      
      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found',
          error: 'Setting does not exist'
        });
      }

      await setting.update({
        is_active: !setting.is_active,
        updated_by: userId
      });

      res.json({
        success: true,
        message: `Setting ${setting.is_active ? 'activated' : 'deactivated'} successfully`,
        data: setting
      });

    } catch (error) {
      logger.error('Error toggling setting: %o', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle setting',
        error: error.message
      });
    }
  }
}

module.exports = new SystemSettingController();

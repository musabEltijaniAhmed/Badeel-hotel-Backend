-- Create system_settings table
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` CHAR(36) NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT,
  `group` VARCHAR(50) NOT NULL COMMENT 'e.g., sms, firebase, email, general',
  `description` VARCHAR(255),
  `is_encrypted` BOOLEAN DEFAULT FALSE COMMENT 'Whether the value should be encrypted (for sensitive data like API keys)',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Whether this setting is currently active',
  `updated_by` CHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`key`),
  KEY `idx_setting_group` (`group`),
  KEY `idx_setting_active` (`is_active`),
  FOREIGN KEY (`updated_by`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `system_settings` (`id`, `key`, `value`, `group`, `description`, `is_encrypted`, `is_active`) VALUES
-- SMS Settings
(UUID(), 'sms_provider_name', 'Unifonic', 'sms', 'SMS Provider Name', FALSE, TRUE),
(UUID(), 'sms_api_key', NULL, 'sms', 'SMS Provider API Key', TRUE, TRUE),
(UUID(), 'sms_sender_id', 'YourApp', 'sms', 'SMS Sender ID', FALSE, TRUE),
(UUID(), 'sms_enabled', 'true', 'sms', 'Enable/Disable SMS Sending', FALSE, TRUE),

-- Firebase Settings
(UUID(), 'firebase_server_key', NULL, 'firebase', 'Firebase Server Key', TRUE, TRUE),
(UUID(), 'firebase_project_id', NULL, 'firebase', 'Firebase Project ID', FALSE, TRUE),
(UUID(), 'firebase_client_email', NULL, 'firebase', 'Firebase Client Email', FALSE, TRUE),
(UUID(), 'firebase_private_key', NULL, 'firebase', 'Firebase Private Key', TRUE, TRUE),
(UUID(), 'push_notifications_enabled', 'true', 'firebase', 'Enable/Disable Push Notifications', FALSE, TRUE),

-- Email Settings
(UUID(), 'smtp_host', NULL, 'email', 'SMTP Host', FALSE, TRUE),
(UUID(), 'smtp_port', '587', 'email', 'SMTP Port', FALSE, TRUE),
(UUID(), 'smtp_user', NULL, 'email', 'SMTP Username', FALSE, TRUE),
(UUID(), 'smtp_password', NULL, 'email', 'SMTP Password', TRUE, TRUE),
(UUID(), 'smtp_from_email', NULL, 'email', 'From Email Address', FALSE, TRUE),
(UUID(), 'smtp_from_name', NULL, 'email', 'From Name', FALSE, TRUE),
(UUID(), 'email_enabled', 'true', 'email', 'Enable/Disable Email Sending', FALSE, TRUE),

-- General Settings
(UUID(), 'app_name', 'Your App Name', 'general', 'Application Name', FALSE, TRUE),
(UUID(), 'app_url', NULL, 'general', 'Application URL', FALSE, TRUE),
(UUID(), 'support_email', NULL, 'general', 'Support Email Address', FALSE, TRUE),
(UUID(), 'support_phone', NULL, 'general', 'Support Phone Number', FALSE, TRUE),
(UUID(), 'maintenance_mode', 'false', 'general', 'Enable/Disable Maintenance Mode', FALSE, TRUE);

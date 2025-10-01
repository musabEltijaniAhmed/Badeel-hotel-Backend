-- Add system:manage permission
INSERT INTO Permissions (name, description, resource, action, isActive, createdAt, updatedAt)
VALUES ('system_manage', 'إدارة إعدادات النظام', 'system', 'manage', true, NOW(), NOW());

-- Get the permission ID
SET @permission_id = LAST_INSERT_ID();

-- Get admin role ID
SELECT @role_id := id FROM Roles WHERE name = 'admin';

-- Link permission to admin role
INSERT INTO RolePermissions (roleId, permissionId, createdAt, updatedAt)
VALUES (@role_id, @permission_id, NOW(), NOW());

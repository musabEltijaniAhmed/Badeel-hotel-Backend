-- Delete existing payment method permissions
DELETE FROM RolePermissions 
WHERE permissionId IN (
  SELECT id FROM Permissions WHERE resource = 'payment_methods'
);

DELETE FROM Permissions WHERE resource = 'payment_methods';

-- Insert new permissions
INSERT INTO Permissions (name, description, resource, action, isActive, createdAt, updatedAt)
VALUES 
('payment_methods_view', 'عرض طرق الدفع', 'payment_methods', 'view', 1, NOW(), NOW()),
('payment_methods_create', 'إنشاء طريقة دفع', 'payment_methods', 'create', 1, NOW(), NOW()),
('payment_methods_edit', 'تحديث طريقة دفع', 'payment_methods', 'edit', 1, NOW(), NOW()),
('payment_methods_delete', 'حذف طريقة دفع', 'payment_methods', 'delete', 1, NOW(), NOW());

-- Link permissions to admin role
INSERT INTO RolePermissions (roleId, permissionId, createdAt, updatedAt)
SELECT 
  (SELECT id FROM Roles WHERE name = 'admin'),
  id,
  NOW(),
  NOW()
FROM Permissions 
WHERE resource = 'payment_methods';

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission, requireAdmin } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');
const { Role, Permission, RolePermission, User } = require('../models');

// التأكد من أن المستخدم admin
router.use(authenticate());
router.use(requireAdmin);

// ===== إدارة الأدوار =====

// عرض جميع الأدوار
router.get('/roles', checkPermission('roles', 'manage'), async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          through: {
            model: RolePermission,
            attributes: []
          }
        }
      ]
    });
    res.json(roles);
  } catch (error) {
    next(error);
  }
});

// إنشاء دور جديد
router.post('/roles', 
  checkPermission('roles', 'manage'),
  validate([
    body('name').notEmpty().isLength({ min: 3, max: 50 }),
    body('description').notEmpty().isLength({ min: 5, max: 200 }),
  ]),
  async (req, res, next) => {
    try {
      const role = await Role.create(req.body);
      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }
);

// تحديث دور
router.put('/roles/:id', 
  checkPermission('roles', 'manage'),
  validate([
    body('name')
      .notEmpty().withMessage('Role name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Role name must be between 2 and 50 characters')
      .matches(/^[a-z_]+$/).withMessage('Role name must contain only lowercase letters and underscores'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 2, max: 200 }).withMessage('Description must be between 2 and 200 characters'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive must be a boolean')
  ]),
  async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ message: 'ROLE_NOT_FOUND' });
      
      await role.update(req.body);
      res.json(role);
    } catch (error) {
      next(error);
    }
  }
);

// حذف دور
router.delete('/roles/:id', 
  checkPermission('roles', 'manage'),
  async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Permission,
            through: RolePermission,
            attributes: ['id', 'name', 'resource', 'action']
          }
        ]
      });

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'ROLE_NOT_FOUND',
          error: `Role with ID ${req.params.id} does not exist`
        });
      }

      // Check if role is assigned to any users
      if (role.Users && role.Users.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'CANNOT_DELETE_ROLE',
          error: 'Role is assigned to users',
          data: {
            usersCount: role.Users.length,
            users: role.Users.map(u => ({ id: u.id, name: u.name, email: u.email }))
          }
        });
      }

      // Check if it's the admin role
      if (role.name === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'CANNOT_DELETE_ADMIN',
          error: 'The admin role cannot be deleted'
        });
      }

      // Remove all permissions from role
      if (role.Permissions && role.Permissions.length > 0) {
        await RolePermission.destroy({
          where: { roleId: role.id }
        });
      }
      
      await role.destroy();

      res.json({
        success: true,
        message: 'ROLE_DELETED',
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.Permissions || []
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===== إدارة الصلاحيات =====

// عرض جميع الصلاحيات
router.get('/permissions', checkPermission('roles', 'manage'), async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
    res.json(permissions);
  } catch (error) {
    next(error);
  }
});

// إنشاء صلاحية جديدة
router.post('/permissions', 
  checkPermission('roles', 'manage'),
  validate([
    body('name').notEmpty().isLength({ min: 3, max: 100 }),
    body('description').notEmpty().isLength({ min: 5, max: 200 }),
    body('resource').notEmpty().isLength({ min: 3, max: 50 }),
    body('action').notEmpty().isLength({ min: 3, max: 50 }),
  ]),
  async (req, res, next) => {
    try {
      const permission = await Permission.create(req.body);
      res.status(201).json(permission);
    } catch (error) {
      next(error);
    }
  }
);

// تحديث صلاحية
router.put('/permissions/:id', 
  checkPermission('roles', 'manage'),
  validate([
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
      .matches(/^[a-z_]+$/).withMessage('Name must contain only lowercase letters and underscores'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 2, max: 200 }).withMessage('Description must be between 2 and 200 characters'),
    body('resource')
      .notEmpty().withMessage('Resource is required')
      .isLength({ min: 2, max: 50 }).withMessage('Resource must be between 2 and 50 characters')
      .matches(/^[a-z_]+$/).withMessage('Resource must contain only lowercase letters and underscores'),
    body('action')
      .notEmpty().withMessage('Action is required')
      .isLength({ min: 2, max: 50 }).withMessage('Action must be between 2 and 50 characters')
      .matches(/^[a-z_]+$/).withMessage('Action must contain only lowercase letters and underscores'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive must be a boolean')
  ]),
  async (req, res, next) => {
    try {
      const permission = await Permission.findByPk(req.params.id);
      if (!permission) return res.status(404).json({ message: 'PERMISSION_NOT_FOUND' });
      
      await permission.update(req.body);
      res.json(permission);
    } catch (error) {
      next(error);
    }
  }
);

// حذف صلاحية
router.delete('/permissions/:id', 
  checkPermission('roles', 'manage'),
  async (req, res, next) => {
    try {
      const permission = await Permission.findByPk(req.params.id);
      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'PERMISSION_NOT_FOUND',
          error: `Permission with ID ${req.params.id} does not exist`
        });
      }

      // Check if permission is assigned to any roles
      const roleCount = await RolePermission.count({
        where: { permissionId: permission.id }
      });

      if (roleCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'PERMISSION_IN_USE',
          error: `Permission is assigned to ${roleCount} role(s). Remove it from roles first.`
        });
      }
      
      await permission.destroy();
      res.json({
        success: true,
        message: 'PERMISSION_DELETED',
        data: {
          id: permission.id,
          name: permission.name,
          resource: permission.resource,
          action: permission.action
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===== ربط الأدوار بالصلاحيات =====

// إضافة صلاحية لدور
router.post('/roles/:roleId/permissions/:permissionId', 
  checkPermission('roles', 'manage'),
  async (req, res, next) => {
    try {
      const { roleId, permissionId } = req.params;
      
      const role = await Role.findByPk(roleId);
      const permission = await Permission.findByPk(permissionId);
      
      if (!role) return res.status(404).json({ message: 'ROLE_NOT_FOUND' });
      if (!permission) return res.status(404).json({ message: 'PERMISSION_NOT_FOUND' });
      
      await RolePermission.findOrCreate({
        where: { roleId, permissionId },
        defaults: { roleId, permissionId }
      });
      
      res.json({ message: 'PERMISSION_ASSIGNED_TO_ROLE' });
    } catch (error) {
      next(error);
    }
  }
);

// إزالة صلاحية من دور
router.delete('/roles/:roleId/permissions/:permissionId', 
  checkPermission('roles', 'manage'),
  async (req, res, next) => {
    try {
      const { roleId, permissionId } = req.params;
      
      const deleted = await RolePermission.destroy({
        where: { roleId, permissionId }
      });
      
      if (deleted === 0) {
        return res.status(404).json({ message: 'ROLE_PERMISSION_NOT_FOUND' });
      }
      
      res.json({ message: 'PERMISSION_REMOVED_FROM_ROLE' });
    } catch (error) {
      next(error);
    }
  }
);

// تحديث جميع صلاحيات دور
router.put('/roles/:roleId/permissions', 
  checkPermission('roles', 'manage'),
  validate([
    body('permissionIds').isArray().withMessage('permissionIds must be an array'),
    body('permissionIds.*').isInt().withMessage('Each permission ID must be an integer'),
  ]),
  async (req, res, next) => {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;
      
      const role = await Role.findByPk(roleId);
      if (!role) return res.status(404).json({ message: 'ROLE_NOT_FOUND' });
      
      // حذف جميع الصلاحيات الحالية
      await RolePermission.destroy({ where: { roleId } });
      
      // إضافة الصلاحيات الجديدة
      const rolePermissions = permissionIds.map(permissionId => ({
        roleId: parseInt(roleId),
        permissionId: parseInt(permissionId)
      }));
      
      await RolePermission.bulkCreate(rolePermissions);
      
      res.json({ 
        message: 'ROLE_PERMISSIONS_UPDATED',
        assignedPermissions: permissionIds.length 
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===== إدارة أدوار المستخدمين =====

// تغيير دور مستخدم
router.patch('/users/:userId/role', 
  checkPermission('users', 'edit'),
  validate([
    body('roleId').isInt().withMessage('Role ID must be an integer'),
  ]),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;
      
      const user = await User.findByPk(userId);
      const role = await Role.findByPk(roleId);
      
      if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND' });
      if (!role) return res.status(404).json({ message: 'ROLE_NOT_FOUND' });
      
      await user.update({ roleId });
      
      res.json({ 
        message: 'USER_ROLE_UPDATED',
        userId: user.id,
        newRole: role.name 
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

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
router.patch('/roles/:id', 
  checkPermission('roles', 'manage'),
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
      const role = await Role.findByPk(req.params.id);
      if (!role) return res.status(404).json({ message: 'ROLE_NOT_FOUND' });
      
      // التأكد من عدم وجود مستخدمين مرتبطين بهذا الدور
      const usersCount = await User.count({ where: { roleId: role.id } });
      if (usersCount > 0) {
        return res.status(400).json({
          message: 'CANNOT_DELETE_ROLE',
          error: 'Role is assigned to users',
          usersCount
        });
      }
      
      await role.destroy();
      res.json({ message: 'ROLE_DELETED' });
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
router.patch('/permissions/:id', 
  checkPermission('roles', 'manage'),
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
      if (!permission) return res.status(404).json({ message: 'PERMISSION_NOT_FOUND' });
      
      await permission.destroy();
      res.json({ message: 'PERMISSION_DELETED' });
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

const { User, Role, Permission, RolePermission } = require('../models');

/**
 * Middleware للتحقق من صلاحية المستخدم
 * @param {string} resource - الموضع المراد الوصول إليه (مثل: products, orders)
 * @param {string} action - الإجراء المراد تنفيذه (مثل: view, create, edit, delete)
 * @returns {Function} middleware function
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // التأكد من وجود المستخدم من middleware المصادقة
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: 'UNAUTHORIZED',
          error: 'User not authenticated'
        });
      }

      // جلب بيانات المستخدم مع دوره وصلاحياته
      const user = await User.findOne({
        where: { id: req.user.id },
        include: [
          {
            model: Role,
            include: [
              {
                model: Permission,
                through: {
                  model: RolePermission,
                  attributes: []
                },
                where: {
                  resource: resource,
                  action: action,
                  isActive: true
                },
                required: false
              }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          message: 'USER_NOT_FOUND',
          error: 'User not found'
        });
      }

      if (!user.Role) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          error: 'User has no role assigned'
        });
      }

      if (!user.Role.isActive) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          error: 'User role is inactive'
        });
      }

      // التحقق من وجود الصلاحية
      const hasPermission = user.Role.Permissions && user.Role.Permissions.length > 0;
      
      if (!hasPermission) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          error: `You don't have permission to ${action} ${resource}`,
          required: `${resource}:${action}`,
          userRole: user.Role.name
        });
      }

      // إضافة معلومات المستخدم والدور للـ request
      req.user.role = user.Role.name;
      req.user.roleId = user.Role.id;
      req.user.permissions = user.Role.Permissions.map(p => `${p.resource}:${p.action}`);

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        message: 'INTERNAL_SERVER_ERROR',
        error: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware للتحقق من دور محدد
 * @param {string|Array} roles - الدور أو الأدوار المسموحة
 * @returns {Function} middleware function
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          message: 'UNAUTHORIZED',
          error: 'User not authenticated'
        });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

       const user = await User.findOne({
        where: { id: req.user.id },
        include: [{ model: Role }]
      });

      console.log('==========', user.Role);
      if (!user || !user.Role) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          error: 'User has no role assigned'
        });
      }

      if (!allowedRoles.includes(user.Role.name)) {
        return res.status(403).json({
          message: 'FORBIDDEN',
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          userRole: user.Role.name
        });
      }

      req.user.role = user.Role.name;
      req.user.roleId = user.Role.id;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        message: 'INTERNAL_SERVER_ERROR',
        error: 'Error checking role'
      });
    }
  };
};

/**
 * Middleware للتحقق من كون المستخدم admin
 */
const requireAdmin = checkRole('admin');

/**
 * Middleware للتحقق من كون المستخدم staff أو admin
 */
const requireStaff = checkRole(['admin', 'staff']);

/**
 * دالة مساعدة للتحقق من صلاحية محددة برمجياً
 * @param {string} userId - معرف المستخدم
 * @param {string} resource - الموضع
 * @param {string} action - الإجراء
 * @returns {Promise<boolean>} هل لديه الصلاحية أم لا
 */
const hasPermission = async (userId, resource, action) => {
  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
              through: {
                model: RolePermission,
                attributes: []
              },
              where: {
                resource: resource,
                action: action,
                isActive: true
              },
              required: false
            }
          ]
        }
      ]
    });

    return user && user.Role && user.Role.Permissions && user.Role.Permissions.length > 0;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

module.exports = {
  checkPermission,
  checkRole,
  requireAdmin,
  requireStaff,
  hasPermission
};

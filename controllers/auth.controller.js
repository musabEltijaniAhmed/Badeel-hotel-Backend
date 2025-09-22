const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { sendSMS } = require('../utils/sms.service');
const { sendEmail } = require('../utils/email.service');
const { PasswordReset } = require('../models');
const { v4: uuidv4 } = require('uuid');



exports.register = async (req, res, next) => {
  try {
  
        const { name, phone, email, password, language } = req.body;
    
    const hashed = await bcrypt.hash(password, 12);
        const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.fail('USER_ALREADY_EXISTS');

        // placeholder token to satisfy NOT NULL constraint
    let token = 'temp';
    let user = await User.create({ name, phone, email, password: hashed, language, token });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '6d' });
    await user.update({ token });
    // Send welcome SMS (optional)
    await sendSMS(phone, 'Welcome to our booking app!');
    return res.success({ user, token }, 'User registered', 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.fail('USER_NOT_FOUND', null, 404);
        const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.fail('INVALID_CREDENTIALS', null, 400);
    }

    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '6d' });
        await user.update({ token });
    return res.success({ user, token }, 'Login success');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
        const { phone } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.fail('USER_NOT_FOUND', null, 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await PasswordReset.create({ userId: user.id, token: otp, expiresAt });

        // Send OTP via SMS // TODO: Send OTP
   await sendSMS(phone, `Your reset OTP is ${otp}`);

    return res.success({ "otp": otp, "expiresAt": expiresAt

     }, 'RESET_OTP_SENT');
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
        const { phone, otp, newPassword } = req.body;
    const record = await PasswordReset.findOne({ where: { token: otp, used: false } });
    if (!record || record.expiresAt < new Date()) return res.fail('RESET_OTP_SENT', null, 400);
    const user = await User.findByPk(record.userId);
    if (!user) return res.fail('USER_NOT_FOUND', null, 404);

        const hashed = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashed });
    await record.update({ used: true });
    return res.success(null, 'PASSWORD_RESET_SUCCESS');
  } catch (error) {
    next(error);
  }
}; 

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
        // remove token from user row
    const userId = req.user?.id;
    if (userId) await User.update({ token: '' }, { where: { id: userId } });
    return res.success(null, 'LOGOUT_SUCCESS');
  } catch (error) {
    next(error);
  }
};

// ===== دوال التسجيل المتخصصة =====

/**
 * تسجيل العملاء - الطريقة الافتراضية
 */
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, password, language } = req.body;
    
    const hashed = await bcrypt.hash(password, 12);
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.fail('USER_ALREADY_EXISTS');

    // إنشاء مستخدم بدور العميل (roleId = 1)
    let token = 'temp';
    let user = await User.create({ 
      name, 
      phone, 
      email, 
      password: hashed, 
      language, 
      token,
      roleId: 1 // customer
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '6d' });
    await user.update({ token });

    // جلب معلومات الدور
    const userWithRole = await User.findByPk(user.id, {
      include: [{ model: Role }]
    });

    return res.success({ 
      user: userWithRole, 
      token,
      userType: 'customer'
    }, 'تم تسجيل العميل بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * تسجيل الموظفين - مباشر بدون كود دعوة
 */
exports.registerStaff = async (req, res, next) => {
  try {
    const { name, phone, email, password, language } = req.body;
    
    const hashed = await bcrypt.hash(password, 12);
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.fail('USER_ALREADY_EXISTS');

    // إنشاء مستخدم بدور الموظف (roleId = 3)
    let token = 'temp';
    let user = await User.create({ 
      name, 
      phone, 
      email, 
      password: hashed, 
      language, 
      token,
      roleId: 3 // staff
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '6d' });
    await user.update({ token });

    // جلب معلومات الدور
    const userWithRole = await User.findByPk(user.id, {
      include: [{ model: Role }]
    });

    return res.success({ 
      user: userWithRole, 
      token,
      userType: 'staff'
    }, 'تم تسجيل الموظف بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * تسجيل المديرين - مباشر بدون كود دعوة
 */
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, phone, email, password, language } = req.body;
    
    const hashed = await bcrypt.hash(password, 12);
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.fail('USER_ALREADY_EXISTS');

    // إنشاء مستخدم بدور المدير (roleId = 2)
    let token = 'temp';
    let user = await User.create({ 
      name, 
      phone, 
      email, 
      password: hashed, 
      language, 
      token,
      roleId: 2 // admin
    });

    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '6d' });
    await user.update({ token });

    // جلب معلومات الدور
    const userWithRole = await User.findByPk(user.id, {
      include: [{ model: Role }]
    });

    return res.success({ 
      user: userWithRole, 
      token,
      userType: 'admin'
    }, 'تم تسجيل المدير بنجاح', 201);
  } catch (error) {
    next(error);
  }
};



// إبقاء الدالة الأساسية للتوافق مع النسخة السابقة
exports.register = exports.registerCustomer;
// Middleware to validate Saudi Arabia phone numbers in E.164 format (e.g. +9665XXXXXXXX)
module.exports = function saudiPhone(field = 'phone') {
  const regex = /^\+9665\d{8}$/; // +966 followed by 9 digits total (5XXXXXXXX)
  return (req, res, next) => {
    const value = req.body[field] || req.query[field] || req.params[field];
    if (!value || !regex.test(value)) {
      return res.fail('Invalid Saudi phone number', { field, value }, 422);
    }
    next();
  };
};
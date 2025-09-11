const { ActivityLog } = require('../models');

module.exports = (action) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await ActivityLog.create({
          adminId: req.user.id,
          action,
          entity: req.baseUrl + req.path,
          meta: { body: req.body, params: req.params },
        });
      } catch (err) {
        // ignore logging errors
      }
    });
    next();
  };
}; 
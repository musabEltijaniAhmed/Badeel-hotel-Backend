const logger = require('../utils/logger');

module.exports = function (err, req, res, next) {
  logger.error(err);
  const status = err.status || 500;
    res.fail(err.message || 'Internal Server Error', process.env.NODE_ENV !== 'production' ? { stack: err.stack } : null, status);
}; 
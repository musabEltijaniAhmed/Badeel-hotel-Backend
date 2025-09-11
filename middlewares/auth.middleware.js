const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

function authenticate() {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'NO_TOKEN' });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(401).json({ message: 'INVALID_TOKEN' });

      req.user = user;
      next();
    } catch (error) {
      logger.error('Auth Error: %o', error);
      return res.status(401).json({ message: 'UNAUTHORIZED' });
    }
  };
}

module.exports = { authenticate }; 
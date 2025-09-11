const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      connectTimeout: 10000, // 10 seconds
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const MAX_RETRIES = 5;
async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
  } catch (err) {
    if (retries > 0) {
      logger.warn(`DB connection failed. Retrying in 5s... (${MAX_RETRIES - retries + 1})`);
      await new Promise((res) => setTimeout(res, 5000));
      return connectWithRetry(retries - 1);
    }
    logger.error('Could not connect to the database after retries.');
    throw err;
  }
}

module.exports = { sequelize, connectWithRetry }; 
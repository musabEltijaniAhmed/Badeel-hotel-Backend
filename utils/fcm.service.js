const admin = require('../config/firebase');
const logger = require('./logger');

async function sendNotification(token, payload) {
  try {
    const response = await admin.messaging().send({ token, ...payload });
    return response;
  } catch (error) {
    logger.error('FCM Error: %o', error);
    throw new Error('FCM_FAILED');
  }
}

module.exports = { sendNotification }; 
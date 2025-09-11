const smsClient = require('../config/sms');
const logger = require('./logger');

async function sendSMS(to, body) {
  try {
    if (!smsClient) {
      logger.warn('SMS credentials not configured. Skipping SMS send.');
      return null;
    }
    const message = await smsClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE,
      body,
    });
    return message.sid;
  } catch (error) {
    logger.error('SMS Error: %o', error);
    throw new Error('SMS_FAILED');
  }
}

module.exports = { sendSMS }; 
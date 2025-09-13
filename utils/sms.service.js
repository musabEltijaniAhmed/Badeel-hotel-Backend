const axios = require('axios');
const smsConfig = require('../config/sms');
const logger = require('./logger');

async function sendSMS(to, body) {
  try {
    if (!smsConfig.token) {
      logger.warn('SMS token not configured. Skipping SMS send.');
      return null;
    }

    // Ensure the phone number is in the correct format (966xxxxxxxxx)
    const formattedNumber = to.startsWith('966') ? to : `966${to.replace(/^\+?966/, '')}`;

    const payload = {
      number: formattedNumber,
      senderName: smsConfig.senderName,
      sendAtOption: "Now",
      messageBody: body,
      allow_duplicate: true
    };

    const response = await axios.post(smsConfig.apiUrl, payload, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${smsConfig.token}`
      }
    });

    if (response.data.status === 'Success') {
      logger.info('SMS sent successfully:', response.data.data.message);
      return response.data.data.message.id;
    } else {
      logger.error('SMS API returned error:', response.data);
      throw new Error('SMS_API_ERROR');
    }
  } catch (error) {
    logger.error('SMS Error: %o', error);
    if (error.response) {
      logger.error('SMS API Response Error:', error.response.data);
    }
    throw new Error('SMS_FAILED');
  }
}

module.exports = { sendSMS }; 
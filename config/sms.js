const axios = require('axios');

const { SMS_TOKEN } = process.env;

const smsConfig = {
  apiUrl: 'https://app.mobile.net.sa/api/v1/send',
  token: SMS_TOKEN,
  senderName: 'Mobile.SA'
};

module.exports = smsConfig; 
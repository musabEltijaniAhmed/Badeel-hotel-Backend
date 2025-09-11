const twilio = require('twilio');

const { TWILIO_SID, TWILIO_AUTH_TOKEN } = process.env;

let smsClient = null;
if (TWILIO_SID && TWILIO_AUTH_TOKEN) {
  smsClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
}

module.exports = smsClient; 
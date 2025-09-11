const transporter = require('../config/email');
const logger = require('./logger');

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    logger.info('Email sent: %s', info.messageId);
    return info.messageId;
  } catch (err) {
    logger.error('Email error: %o', err);
    throw new Error('EMAIL_FAILED');
  }
}

module.exports = { sendEmail }; 
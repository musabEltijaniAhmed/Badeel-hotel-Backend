const stripe = require('../config/stripe');
const logger = require('./logger');

async function charge({ amount, currency = 'usd', source, description }) {
  if (!stripe) {
    logger.warn('Stripe not configured, skipping charge');
    return { id: 'fake_charge', amount };
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: source,
      confirm: true,
      description,
    });
    return paymentIntent;
  } catch (err) {
    logger.error('Stripe error: %o', err);
    throw err;
  }
}

module.exports = { charge }; 
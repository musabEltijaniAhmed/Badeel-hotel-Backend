const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2023-10-16' }) : null;
module.exports = stripe; 
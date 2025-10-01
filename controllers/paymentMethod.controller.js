'use strict';

const { PaymentMethod } = require('../models');
const { Op } = require('sequelize');

/**
 * Admin Controllers
 */

// List all payment methods (with pagination and filters)
exports.listPaymentMethods = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { provider_name: { [Op.like]: `%${search}%` } },
        { provider_code: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await PaymentMethod.findAndCountAll({
      where,
      order: [['display_order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      total_pages: Math.ceil(count / limit),
      current_page: parseInt(page),
      payment_methods: rows.map(method => method.toAdminJSON())
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

// Create a new payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.create(req.body);
    res.status(201).json(paymentMethod.toAdminJSON());
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Provider code must be unique' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      res.status(500).json({ error: 'Failed to create payment method' });
    }
  }
};

// Update a payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByPk(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await paymentMethod.update(req.body);
    res.json(paymentMethod.toAdminJSON());
  } catch (error) {
    console.error('Error in updatePaymentMethod:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ 
        error: 'Provider code must be unique',
        details: error.message
      });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ 
        error: error.errors[0].message,
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update payment method',
        details: error.message
      });
    }
  }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByPk(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    await paymentMethod.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
};

// Toggle payment method status (block/unblock)
exports.togglePaymentMethodStatus = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByPk(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const newStatus = paymentMethod.status === 'active' ? 'blocked' : 'active';
    await paymentMethod.update({ status: newStatus });
    
    res.json(paymentMethod.toAdminJSON());
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment method status' });
  }
};

/**
 * Client Controllers
 */

// List active payment methods for clients
exports.listActivePaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findAll({
      where: { status: 'active' },
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      payment_methods: paymentMethods.map(method => method.toPublicJSON())
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

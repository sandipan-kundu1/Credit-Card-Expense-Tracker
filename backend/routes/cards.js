const express = require('express');
const { body, validationResult } = require('express-validator');
const CreditCard = require('../models/CreditCard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all credit cards for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cards = await CreditCard.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ lastUsed: -1 });

    res.json({
      message: 'Credit cards retrieved successfully',
      cards
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Server error retrieving cards' });
  }
});

// Get single credit card
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    res.json({
      message: 'Credit card retrieved successfully',
      card
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ message: 'Server error retrieving card' });
  }
});

// Add new credit card
router.post('/', authenticateToken, [
  body('cardName').trim().isLength({ min: 2 }).withMessage('Card name must be at least 2 characters'),
  body('cardNumber').matches(/^\d{16}$/).withMessage('Card number must be exactly 16 digits'),
  body('cardType').isIn(['Visa', 'Mastercard', 'American Express', 'Discover', 'Other']).withMessage('Invalid card type'),
  body('expiryMonth').isInt({ min: 1, max: 12 }).withMessage('Expiry month must be between 1 and 12'),
  body('expiryYear').isInt({ min: new Date().getFullYear() }).withMessage('Expiry year must be current year or later'),
  body('creditLimit').isFloat({ min: 100 }).withMessage('Credit limit must be at least $100'),
  body('currentBalance').optional().isFloat({ min: 0 }).withMessage('Current balance must be 0 or greater'),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      cardName,
      cardNumber,
      cardType,
      expiryMonth,
      expiryYear,
      creditLimit,
      currentBalance,
      interestRate,
      color
    } = req.body;

    // Check if card number already exists for this user
    const existingCard = await CreditCard.findOne({
      userId: req.user._id,
      cardNumber: cardNumber.replace(/\s/g, '')
    });

    if (existingCard) {
      return res.status(400).json({ message: 'A card with this number already exists' });
    }

    // Validate that current balance doesn't exceed credit limit
    const balance = parseFloat(currentBalance) || 0;
    const limit = parseFloat(creditLimit);
    
    if (balance > limit) {
      return res.status(400).json({ message: 'Current balance cannot exceed credit limit' });
    }

    // Create new credit card
    const card = new CreditCard({
      userId: req.user._id,
      cardName,
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardType,
      expiryMonth,
      expiryYear,
      creditLimit: limit,
      currentBalance: balance,
      interestRate: interestRate || 18.5,
      color: color || '#1976d2'
    });

    await card.save();

    res.status(201).json({
      message: 'Credit card added successfully',
      card
    });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ message: 'Server error adding card' });
  }
});

// Update credit card
router.put('/:id', authenticateToken, [
  body('cardName').optional().trim().isLength({ min: 2 }).withMessage('Card name must be at least 2 characters'),
  body('creditLimit').optional().isFloat({ min: 100 }).withMessage('Credit limit must be at least $100'),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const { cardName, creditLimit, interestRate, color } = req.body;

    if (cardName) card.cardName = cardName;
    if (creditLimit) card.creditLimit = creditLimit;
    if (interestRate !== undefined) card.interestRate = interestRate;
    if (color) card.color = color;

    await card.save();

    res.json({
      message: 'Credit card updated successfully',
      card
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error updating card' });
  }
});

// Deactivate credit card (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    card.isActive = false;
    await card.save();

    res.json({ message: 'Credit card deactivated successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error deactivating card' });
  }
});

// Make payment to credit card (reduce balance)
router.post('/:id/payment', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount } = req.body;
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    if (amount > card.currentBalance) {
      return res.status(400).json({ message: 'Payment amount cannot exceed current balance' });
    }

    card.currentBalance -= amount;
    card.availableCredit = card.creditLimit - card.currentBalance;
    await card.save();

    res.json({
      message: 'Payment processed successfully',
      card,
      paymentAmount: amount
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Server error processing payment' });
  }
});

// Get card utilization and stats
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const utilizationRate = (card.currentBalance / card.creditLimit) * 100;
    const availableCredit = card.availableCredit;
    const monthlyInterest = (card.currentBalance * (card.interestRate / 100)) / 12;

    const stats = {
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
      availableCredit,
      monthlyInterest: parseFloat(monthlyInterest.toFixed(2)),
      creditLimit: card.creditLimit,
      currentBalance: card.currentBalance,
      isOverLimit: card.currentBalance > card.creditLimit,
      daysUntilExpiry: Math.ceil((new Date(card.expiryYear, card.expiryMonth - 1) - new Date()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      message: 'Card statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error retrieving statistics' });
  }
});

module.exports = router;

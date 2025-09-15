const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const CreditCard = require('../models/CreditCard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all expenses for user with pagination and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      cardId,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user._id };

    // Apply filters
    if (category) query.category = category;
    if (cardId) query.cardId = cardId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('cardId', 'cardName cardNumber color')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      message: 'Expenses retrieved successfully',
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalExpenses: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving expenses' });
  }
});

// Get single expense
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('cardId', 'cardName cardNumber color');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({
      message: 'Expense retrieved successfully',
      expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error retrieving expense' });
  }
});

// Add new expense
router.post('/', authenticateToken, [
  body('cardId').isMongoId().withMessage('Valid card ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description is required and must be less than 200 characters'),
  body('category').isIn([
    'Food & Dining', 'Shopping', 'Transportation', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
    'Groceries', 'Gas', 'Insurance', 'Investment', 'Other'
  ]).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
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
      cardId,
      amount,
      description,
      category,
      subcategory,
      merchant,
      location,
      date,
      isRecurring,
      recurringFrequency,
      tags,
      notes,
      isEssential
    } = req.body;

    // Verify card belongs to user and can make purchase
    const card = await CreditCard.findOne({
      _id: cardId,
      userId: req.user._id,
      isActive: true
    });

    if (!card) {
      return res.status(404).json({ message: 'Credit card not found or inactive' });
    }

    if (!card.canMakePurchase(amount)) {
      return res.status(400).json({ 
        message: 'Insufficient credit limit',
        availableCredit: card.availableCredit
      });
    }

    // Store original card balance for rollback
    const originalBalance = card.currentBalance;
    
    // Create expense
    const expense = new Expense({
      userId: req.user._id,
      cardId,
      amount,
      description,
      category,
      subcategory,
      merchant,
      location,
      date: date ? new Date(date) : new Date(),
      isRecurring: isRecurring || false,
      recurringFrequency,
      tags: tags || [],
      notes,
      isEssential: isEssential || false
    });

    let savedExpense;
    let cardUpdated = false;
    
    try {
      // Save expense first
      savedExpense = await expense.save();
      
      // Update card balance only after expense is saved
      card.makePurchase(amount);
      await card.save();
      cardUpdated = true;
      
    } catch (expenseError) {
      // If card was updated but expense failed, rollback card balance
      if (cardUpdated) {
        card.currentBalance = originalBalance;
        card.availableCredit = card.creditLimit - card.currentBalance;
        await card.save();
        console.log('Card balance rolled back due to expense save failure');
      }
      console.error('Expense save failed:', expenseError);
      throw expenseError;
    }

    // Populate card info for response
    await savedExpense.populate('cardId', 'cardName cardNumber color');

    res.status(201).json({
      message: 'Expense added successfully',
      expense: savedExpense,
      updatedCard: {
        id: card._id,
        currentBalance: card.currentBalance,
        availableCredit: card.availableCredit
      }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Server error adding expense',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update expense
router.put('/:id', authenticateToken, [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Description must be less than 200 characters'),
  body('category').optional().isIn([
    'Food & Dining', 'Shopping', 'Transportation', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
    'Groceries', 'Gas', 'Insurance', 'Investment', 'Other'
  ]).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const originalAmount = expense.amount;
    const {
      amount,
      description,
      category,
      subcategory,
      merchant,
      location,
      tags,
      notes,
      isEssential
    } = req.body;

    // Update expense fields
    if (amount !== undefined) expense.amount = amount;
    if (description) expense.description = description;
    if (category) expense.category = category;
    if (subcategory !== undefined) expense.subcategory = subcategory;
    if (merchant !== undefined) expense.merchant = merchant;
    if (location !== undefined) expense.location = location;
    if (tags !== undefined) expense.tags = tags;
    if (notes !== undefined) expense.notes = notes;
    if (isEssential !== undefined) expense.isEssential = isEssential;

    await expense.save();

    // Update card balance if amount changed
    if (amount !== undefined && amount !== originalAmount) {
      const card = await CreditCard.findById(expense.cardId);
      if (card) {
        const difference = amount - originalAmount;
        card.currentBalance += difference;
        card.availableCredit = card.creditLimit - card.currentBalance;
        await card.save();
      }
    }

    await expense.populate('cardId', 'cardName cardNumber color');

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update card balance (refund the amount)
    const card = await CreditCard.findById(expense.cardId);
    if (card) {
      card.currentBalance -= expense.amount;
      card.availableCredit = card.creditLimit - card.currentBalance;
      await card.save();
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
});

// Get expenses by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const { startDate, endDate } = req.query;

    const query = { userId: req.user._id, category };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate('cardId', 'cardName cardNumber color')
      .sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      message: 'Category expenses retrieved successfully',
      category,
      expenses,
      totalAmount,
      count: expenses.length
    });
  } catch (error) {
    console.error('Get category expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving category expenses' });
  }
});

// Get recent expenses
router.get('/recent/:limit?', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;

    const expenses = await Expense.find({ userId: req.user._id })
      .populate('cardId', 'cardName cardNumber color')
      .sort({ date: -1 })
      .limit(limit);

    res.json({
      message: 'Recent expenses retrieved successfully',
      expenses
    });
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving recent expenses' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditCard',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Shopping',
      'Transportation',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Travel',
      'Education',
      'Groceries',
      'Gas',
      'Insurance',
      'Investment',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  merchant: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 500
  },
  receiptUrl: {
    type: String
  },
  isEssential: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ cardId: 1, date: -1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Static method to get expenses by date range
expenseSchema.statics.getExpensesByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('cardId', 'cardName maskedCardNumber').sort({ date: -1 });
};

// Static method to get expenses by category
expenseSchema.statics.getExpensesByCategory = function(userId, category) {
  return this.find({ userId, category })
    .populate('cardId', 'cardName maskedCardNumber')
    .sort({ date: -1 });
};

// Static method to get monthly expenses
expenseSchema.statics.getMonthlyExpenses = function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.getExpensesByDateRange(userId, startDate, endDate);
};

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema);

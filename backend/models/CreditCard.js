const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardName: {
    type: String,
    required: true,
    trim: true
  },
  cardNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Simple validation for dummy card numbers (16 digits)
        return /^\d{16}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Card number must be 16 digits'
    }
  },
  cardType: {
    type: String,
    enum: ['Visa', 'Mastercard', 'American Express', 'Discover', 'Other'],
    required: true
  },
  expiryMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  expiryYear: {
    type: Number,
    required: true,
    min: new Date().getFullYear()
  },
  creditLimit: {
    type: Number,
    required: true,
    min: 0
  },
  currentBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  availableCredit: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 18.5,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#1976d2' // Material-UI primary blue
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update available credit before saving
creditCardSchema.pre('save', function(next) {
  this.availableCredit = this.creditLimit - this.currentBalance;
  next();
});

// Virtual for masked card number
creditCardSchema.virtual('maskedCardNumber').get(function() {
  const cardNum = this.cardNumber.replace(/\s/g, '');
  return `****-****-****-${cardNum.slice(-4)}`;
});

// Method to check if card can make a purchase
creditCardSchema.methods.canMakePurchase = function(amount) {
  const available = this.creditLimit - this.currentBalance;
  return available >= amount && this.isActive;
};

// Method to make a purchase (update balance)
creditCardSchema.methods.makePurchase = function(amount) {
  if (this.canMakePurchase(amount)) {
    this.currentBalance += amount;
    this.availableCredit = this.creditLimit - this.currentBalance;
    this.lastUsed = new Date();
    return true;
  }
  return false;
};

// Ensure virtual fields are serialized
creditCardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CreditCard', creditCardSchema);

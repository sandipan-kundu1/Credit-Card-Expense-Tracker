// Utility functions for the application

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount || 0);
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (short, medium, long)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  const dateObj = new Date(date);
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
};

/**
 * Format credit card number with spaces
 * @param {string} cardNumber - Card number to format
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  return cardNumber.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Mask credit card number
 * @param {string} cardNumber - Card number to mask
 * @returns {string} Masked card number
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return `****-****-****-${cleaned.slice(-4)}`;
};

/**
 * Calculate credit utilization percentage
 * @param {number} currentBalance - Current balance
 * @param {number} creditLimit - Credit limit
 * @returns {number} Utilization percentage
 */
export const calculateUtilization = (currentBalance, creditLimit) => {
  if (creditLimit === 0) return 0;
  return (currentBalance / creditLimit) * 100;
};

/**
 * Get utilization color based on percentage
 * @param {number} utilization - Utilization percentage
 * @returns {string} MUI color name
 */
export const getUtilizationColor = (utilization) => {
  if (utilization < 30) return 'success';
  if (utilization < 70) return 'warning';
  return 'error';
};

/**
 * Get category color for expense categories
 * @param {string} category - Expense category
 * @returns {string} MUI color name
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Food & Dining': 'error',
    'Shopping': 'warning',
    'Transportation': 'info',
    'Entertainment': 'secondary',
    'Bills & Utilities': 'primary',
    'Healthcare': 'success',
    'Travel': 'info',
    'Education': 'primary',
    'Groceries': 'warning',
    'Gas': 'error',
    'Insurance': 'primary',
    'Investment': 'success',
    'Other': 'default'
  };
  return colors[category] || 'default';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate credit card number (basic Luhn algorithm)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Is valid card number
 */
export const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{16}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Get card type from card number
 * @param {string} cardNumber - Card number
 * @returns {string} Card type
 */
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6/.test(cleaned)) return 'Discover';
  
  return 'Other';
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Calculate percentage change
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by multiple criteria
 * @param {Array} array - Array to sort
 * @param {Array} criteria - Sort criteria
 * @returns {Array} Sorted array
 */
export const multiSort = (array, criteria) => {
  return array.sort((a, b) => {
    for (let criterion of criteria) {
      const { key, order = 'asc' } = criterion;
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Generate expense insights
 * @param {Array} expenses - Array of expenses
 * @returns {Object} Insights object
 */
export const generateExpenseInsights = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return { totalSpent: 0, avgTransaction: 0, topCategory: null };
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgTransaction = totalSpent / expenses.length;
  
  const categoryTotals = groupBy(expenses, 'category');
  const topCategory = Object.entries(categoryTotals)
    .map(([category, expenseList]) => ({
      category,
      total: expenseList.reduce((sum, expense) => sum + expense.amount, 0)
    }))
    .sort((a, b) => b.total - a.total)[0];

  return {
    totalSpent,
    avgTransaction,
    topCategory: topCategory?.category || null,
    transactionCount: expenses.length
  };
};

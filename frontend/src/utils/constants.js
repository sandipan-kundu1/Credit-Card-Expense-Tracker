// Expense categories
export const EXPENSE_CATEGORIES = [
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
];

// Credit card types
export const CARD_TYPES = [
  'Visa',
  'Mastercard',
  'American Express',
  'Discover',
  'Other'
];

// Card colors for selection
export const CARD_COLORS = [
  '#1976d2', // Blue
  '#dc004e', // Pink
  '#7b1fa2', // Purple
  '#388e3c', // Green
  '#f57c00', // Orange
  '#5d4037', // Brown
  '#616161', // Grey
  '#0097a7', // Cyan
  '#303f9f', // Indigo
  '#c62828'  // Red
];

// Currency options
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
];

// Dummy credit card numbers for testing
export const TEST_CARD_NUMBERS = {
  visa: '4111111111111111',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  discover: '6011111111111117'
};

// Chart color schemes
export const CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF',
  '#4BC0C0',
  '#FF6384'
];

// Date format options
export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM dd, yyyy',
  long: 'MMMM dd, yyyy',
  full: 'EEEE, MMMM dd, yyyy'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
    GOOGLE: '/auth/google'
  },
  CARDS: {
    BASE: '/cards',
    PAYMENT: (id) => `/cards/${id}/payment`,
    STATS: (id) => `/cards/${id}/stats`
  },
  EXPENSES: {
    BASE: '/expenses',
    CATEGORY: (category) => `/expenses/category/${category}`,
    RECENT: (limit) => `/expenses/recent/${limit}`
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    MONTHLY: (year, month) => `/analytics/monthly/${year}/${month}`,
    INSIGHTS: '/analytics/insights',
    COMPARISON: '/analytics/categories/comparison'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  CARD_NUMBER_LENGTH: 16,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MAX_LENGTH: 200,
  NOTES_MAX_LENGTH: 500
};

// Theme configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

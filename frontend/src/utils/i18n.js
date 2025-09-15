// Simple internationalization utility
const translations = {
  en: {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'view_all': 'View All',
    
    // Auth
    'login': 'Login',
    'register': 'Register',
    'logout': 'Logout',
    'email': 'Email',
    'password': 'Password',
    'name': 'Name',
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'forgot_password': 'Forgot Password?',
    'dont_have_account': "Don't have an account?",
    'already_have_account': 'Already have an account?',
    
    // Dashboard
    'dashboard': 'Dashboard',
    'this_month': 'This Month',
    'credit_cards': 'Credit Cards',
    'available_credit': 'Available Credit',
    'utilization': 'Utilization',
    'spending_trend': 'Spending Trend',
    'top_categories': 'Top Categories',
    'recent_expenses': 'Recent Expenses',
    'add_expense': 'Add Expense',
    'active_cards': 'Active cards',
    'transactions': 'transactions',
    'total_limit': 'Total limit',
    
    // Categories
    'food_dining': 'Food & Dining',
    'shopping': 'Shopping',
    'transportation': 'Transportation',
    'entertainment': 'Entertainment',
    'bills_utilities': 'Bills & Utilities',
    'healthcare': 'Healthcare',
    'travel': 'Travel',
    'education': 'Education',
    'groceries': 'Groceries',
    'gas': 'Gas',
    'insurance': 'Insurance',
    'investment': 'Investment',
    'other': 'Other',
    
    // Status
    'good': 'Good',
    'fair': 'Fair',
    'high': 'High',
    'no_expenses_yet': 'No expenses yet',
    'start_adding_expenses': 'Start adding expenses to see categories',
    'no_recent_expenses': 'No recent expenses',
    'start_tracking_expenses': 'Start tracking your expenses to see them here'
  }
};

let currentLanguage = 'en';

export const t = (key, defaultValue = key) => {
  return translations[currentLanguage]?.[key] || defaultValue;
};

export const setLanguage = (lang) => {
  currentLanguage = lang;
};

export const getCurrentLanguage = () => currentLanguage;
# Credit Card Expense Tracker - Testing Guide

## Quick Setup & Testing

### 1. Prerequisites
- MongoDB running on localhost:27017
- Node.js installed
- All dependencies installed (`npm run install-deps`)

### 2. Setup Sample Data
```bash
# Seed the database with sample data
node seed-data.js
```

### 3. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

### 4. Test API Endpoints
```bash
# Test all API endpoints
node test-api.js
```

## Sample Login Credentials

After running the seeder, use these credentials:

**User 1 (John Doe)**
- Email: `john.doe@example.com`
- Password: `password123`
- Has 3 credit cards with sample expenses

**User 2 (Sandipan Kundu)**
- Email: `sandipan.kundu@example.com`
- Password: `password123`
- Has 1 credit card (HDFC Regalia)

## Testing Scenarios

### Scenario 1: New User Experience
1. **Register**: Create account with new email
2. **Add First Card**: Use sample card data from guide
3. **Add Expenses**: Create 5-10 sample expenses
4. **View Dashboard**: Check analytics and insights

### Scenario 2: Existing User (John Doe)
1. **Login**: Use john.doe@example.com
2. **View Cards**: Should see 3 cards with balances
3. **Add Expense**: Create new expense on any card
4. **Make Payment**: Reduce balance on a card
5. **View Analytics**: Check monthly reports

### Scenario 3: Credit Card Management
1. **Add New Card**: Test card validation
2. **View Utilization**: Check percentage calculations
3. **Make Payment**: Test payment processing
4. **Deactivate Card**: Test soft delete functionality

### Scenario 4: Expense Tracking
1. **Add Expenses**: Different categories and amounts
2. **Filter by Category**: Test category filtering
3. **Date Range**: Filter by date ranges
4. **Edit/Delete**: Modify existing expenses

## Feature Testing Checklist

### ✅ Authentication
- [ ] User registration
- [ ] User login
- [ ] JWT token handling
- [ ] Profile management
- [ ] Password change
- [ ] Logout functionality

### ✅ Credit Card Management
- [ ] Add new credit card
- [ ] View all cards
- [ ] Card validation (16 digits)
- [ ] Credit limit tracking
- [ ] Balance calculations
- [ ] Payment processing
- [ ] Card deactivation

### ✅ Expense Tracking
- [ ] Add new expense
- [ ] View expense history
- [ ] Category filtering
- [ ] Date filtering
- [ ] Edit expenses
- [ ] Delete expenses
- [ ] Card association

### ✅ Analytics & Reports
- [ ] Dashboard overview
- [ ] Monthly spending reports
- [ ] Category breakdown
- [ ] Utilization percentages
- [ ] Savings suggestions
- [ ] Spending trends

### ✅ UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Form validation
- [ ] Navigation

## Common Test Cases

### Credit Card Tests
```javascript
// Valid card numbers for testing
const testCards = {
  visa: '4532123456789012',
  mastercard: '5555123456789012',
  amex: '3782123456789012',
  discover: '6011123456789012'
};
```

### Expense Categories
- Groceries
- Dining
- Gas
- Shopping
- Entertainment
- Bills
- Healthcare
- Travel
- Other

### Edge Cases to Test
1. **Credit Limit Exceeded**: Add expenses beyond credit limit
2. **Invalid Card Numbers**: Test validation
3. **Expired Cards**: Test with past expiry dates
4. **Zero/Negative Amounts**: Test input validation
5. **Long Descriptions**: Test character limits
6. **Special Characters**: Test input sanitization

## API Testing with curl

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123"}'
```

### Get Cards
```bash
curl -X GET http://localhost:5000/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Test Expense",
    "amount": 50.00,
    "category": "Testing",
    "cardId": "CARD_ID"
  }'
```

## Performance Testing

### Load Testing Points
1. **Login Endpoint**: Multiple concurrent logins
2. **Card Retrieval**: Large number of cards
3. **Expense Queries**: Complex filtering
4. **Analytics**: Heavy calculations

### Database Queries to Monitor
```javascript
// Check slow queries
db.setProfilingLevel(2)
db.system.profile.find().sort({ts: -1}).limit(5)
```

## Security Testing

### Authentication Tests
- [ ] JWT token expiration
- [ ] Invalid token handling
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input sanitization

### Authorization Tests
- [ ] User can only see own data
- [ ] Card ownership validation
- [ ] Expense ownership validation

## Browser Testing

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- iOS Safari
- Android Chrome
- Responsive breakpoints

## Troubleshooting

### Common Issues

**Cards not showing:**
```bash
# Check database
node debug-db.js

# Check API response
curl -X GET http://localhost:5000/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Authentication errors:**
- Verify JWT_SECRET in backend/.env
- Check token in localStorage
- Ensure CORS is configured

**Database connection:**
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Test connection with MongoDB Compass

### Debug Commands
```bash
# Check backend logs
cd backend && npm start

# Check frontend console
# Open browser dev tools -> Console

# Test database connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/creditcard_tracker')
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Error:', err));
"
```

## Automated Testing

### Unit Tests (Future Enhancement)
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Integration Tests
```bash
# API integration tests
npm run test:integration
```

This comprehensive testing guide should help you thoroughly test all aspects of the Credit Card Expense Tracker application!
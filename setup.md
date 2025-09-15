# Credit Card Expense Tracker - Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Either local installation or MongoDB Atlas account
3. **Google OAuth Credentials** (optional for Google login)

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies (backend + frontend)
npm run install-deps
```

### 2. Database Setup

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**Option B: MongoDB Atlas (Cloud)**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get connection string
- Update `MONGODB_URI` in backend/.env

### 3. Environment Configuration

**Backend (.env file already created):**
- Update `JWT_SECRET` with a secure random string
- Update `MONGODB_URI` if using Atlas
- Add Google OAuth credentials (optional)

**Frontend (.env file already created):**
- Update `REACT_APP_GOOGLE_CLIENT_ID` if using Google OAuth

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Update both .env files with your credentials

### 5. Start the Application

```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually:
npm run server  # Backend only (port 5000)
npm run client  # Frontend only (port 3000)
```

## Default URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/api/health

## Test User Journey

1. **Register/Login**: Create account or use Google OAuth
2. **Add Credit Card**: Add a dummy 16-digit card number
3. **Add Expenses**: Track spending with categories
4. **View Analytics**: Check dashboard and analytics
5. **Manage Profile**: Update settings and preferences

## Dummy Credit Card Numbers for Testing

- Visa: 4111111111111111
- Mastercard: 5555555555554444
- American Express: 378282246310005

## Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for Atlas)

**Port Conflicts:**
- Backend: Change PORT in backend/.env
- Frontend: Set PORT=3001 in frontend/.env

**Google OAuth Issues:**
- Verify redirect URI matches exactly
- Check client ID and secret
- Ensure Google+ API is enabled

## Features Overview

### ✅ Authentication
- JWT-based authentication
- Google OAuth integration
- Password reset functionality

### ✅ Credit Card Management
- Add multiple dummy credit cards
- Track balances and limits
- Credit utilization monitoring

### ✅ Expense Tracking
- Manual expense entry
- 13 predefined categories
- Tags and notes support
- Essential vs non-essential marking

### ✅ Analytics & Insights
- Monthly spending reports
- Category-wise breakdowns
- Spending trends (6 months)
- Personalized savings suggestions
- Credit utilization insights

### ✅ Dashboard
- Real-time spending overview
- Recent transactions
- Quick stats and charts
- Credit card summaries

### ✅ Responsive Design
- Mobile-friendly interface
- Material-UI components
- Dark/light theme support
- Intuitive navigation

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/google` - Google OAuth
- GET `/api/auth/me` - Get current user

### Credit Cards
- GET `/api/cards` - Get user's cards
- POST `/api/cards` - Add new card
- PUT `/api/cards/:id` - Update card
- DELETE `/api/cards/:id` - Deactivate card

### Expenses
- GET `/api/expenses` - Get expenses (with pagination)
- POST `/api/expenses` - Add expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Analytics
- GET `/api/analytics/dashboard` - Dashboard data
- GET `/api/analytics/monthly/:year/:month` - Monthly report
- GET `/api/analytics/insights` - Spending insights

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

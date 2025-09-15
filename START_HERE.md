# 💳 Credit Card Expense Tracker - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
# Run the installation script
install.bat

# OR manually install:
npm run install-deps
```

### Step 2: Start the Application
```bash
npm run dev
```

### Step 3: Open Your Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 🎯 What You Can Do

### 1. **Authentication**
- Register with email/password
- Login with Google OAuth
- Secure JWT-based sessions

### 2. **Credit Card Management**
- Add dummy credit cards (16-digit numbers)
- Track balances and credit limits
- Monitor credit utilization
- Make payments to reduce balances

### 3. **Expense Tracking**
- Add expenses manually with categories
- Tag expenses as essential/non-essential
- Add merchant, location, and notes
- Edit and delete expenses

### 4. **Analytics & Insights**
- Real-time dashboard with charts
- Monthly spending reports
- Category-wise breakdowns
- Personalized savings suggestions
- 6-month spending trends

### 5. **Profile Management**
- Update personal information
- Set monthly budgets
- Change password
- Customize preferences

## 🧪 Test Data

Use these dummy credit card numbers:
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

## 🛠️ Configuration

### MongoDB Setup
1. **Local MongoDB**: Install and start MongoDB service
2. **MongoDB Atlas**: Update `MONGODB_URI` in `backend/.env`

### Google OAuth (Optional)
1. Get credentials from Google Cloud Console
2. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`
3. Update `REACT_APP_GOOGLE_CLIENT_ID` in `frontend/.env`

## 📱 Features Overview

✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Material-UI** - Modern, attractive interface
✅ **Real-time Updates** - Instant balance and utilization updates
✅ **Data Visualization** - Charts and graphs for insights
✅ **Security** - JWT authentication, password hashing, input validation
✅ **Error Handling** - Comprehensive error messages and validation

## 🔧 Troubleshooting

**Port Issues?**
- Backend: Change `PORT` in `backend/.env`
- Frontend: Add `PORT=3001` to `frontend/.env`

**MongoDB Connection?**
- Check if MongoDB is running
- Verify connection string in `.env`

**Dependencies Missing?**
- Run `npm run install-deps` again
- Check Node.js version (v14+ required)

## 📊 Project Structure

```
├── backend/          # Express.js API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Authentication & validation
│   └── config/       # Passport configuration
├── frontend/         # React.js application
│   ├── src/
│   │   ├── pages/    # Main application pages
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/ # React context providers
│   │   └── utils/    # Helper functions
└── docs/            # Documentation
```

## 🎨 UI Highlights

- **Dashboard**: Overview with spending charts and recent transactions
- **Credit Cards**: Visual card management with utilization bars
- **Expenses**: Filterable list with category chips and search
- **Analytics**: Interactive charts and personalized insights
- **Profile**: User settings and preferences management

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers

## 📈 Analytics Features

- Monthly spending summaries
- Category-wise expense breakdown
- Credit utilization monitoring
- Spending trend analysis (6 months)
- Savings suggestions based on patterns
- Essential vs non-essential expense tracking

## 🎯 User Journey

1. **Sign Up/Login** → Create account or use Google
2. **Add Credit Card** → Enter dummy 16-digit card number
3. **Add Expenses** → Track spending with categories
4. **View Dashboard** → See spending overview and charts
5. **Check Analytics** → Get insights and savings tips
6. **Manage Profile** → Update settings and preferences

## 💡 Pro Tips

- Use the **Essential** flag to track necessary vs discretionary spending
- Set a **monthly budget** in your profile for better tracking
- Check the **Analytics** page for personalized savings suggestions
- Use **tags** to add custom labels to your expenses
- Make **payments** on your cards to see utilization changes

## 🚀 Ready to Start?

Run `npm run dev` and visit http://localhost:3000 to begin tracking your credit card expenses!

---

**Need Help?** Check `setup.md` for detailed configuration instructions.

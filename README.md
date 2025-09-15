# Credit Card Expense Tracker

A comprehensive MERN stack application for tracking credit card expenses with JWT and Google OAuth authentication.

## Features

- 🔐 **Authentication**: JWT tokens and Google OAuth integration
- 💳 **Credit Card Management**: Add and manage multiple dummy credit cards
- 📊 **Expense Tracking**: Manual expense entry with categorization
- 📈 **Analytics**: Section-wise expenses, monthly reports, and savings suggestions
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Attractive and user-friendly design

## Tech Stack

- **Frontend**: React.js, Material-UI, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Google OAuth 2.0
- **Styling**: CSS3, Material-UI components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google OAuth credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-deps
   ```

3. Set up environment variables (see .env.example files)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── backend/          # Express.js API server
├── frontend/         # React.js client
├── package.json      # Root package.json for scripts
└── README.md         # Project documentation
```

## Environment Variables

Create `.env` files in both backend and frontend directories with the required variables.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

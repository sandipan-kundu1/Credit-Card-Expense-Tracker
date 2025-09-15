const express = require('express');
const Expense = require('../models/Expense');
const CreditCard = require('../models/CreditCard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get current month expenses
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const monthlyExpenses = await Expense.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    }).populate('cardId', 'cardName cardNumber color');

    // Get all user cards
    const cards = await CreditCard.find({ userId, isActive: true });

    // Calculate monthly totals by category
    const categoryTotals = {};
    monthlyExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    // Calculate total monthly spending
    const totalMonthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate total credit utilization
    const totalCreditLimit = cards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalCurrentBalance = cards.reduce((sum, card) => sum + card.currentBalance, 0);
    const overallUtilization = totalCreditLimit > 0 ? (totalCurrentBalance / totalCreditLimit) * 100 : 0;

    // Get last 6 months spending trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const trendMonth = new Date(currentYear, currentMonth - i, 1);
      const trendMonthEnd = new Date(currentYear, currentMonth - i + 1, 0, 23, 59, 59);
      
      const monthExpenses = await Expense.find({
        userId,
        date: { $gte: trendMonth, $lte: trendMonthEnd }
      });

      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyTrend.push({
        month: trendMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthTotal
      });
    }

    res.json({
      message: 'Dashboard analytics retrieved successfully',
      analytics: {
        currentMonth: {
          totalSpending: totalMonthlySpending,
          expenseCount: monthlyExpenses.length,
          categoryBreakdown: categoryTotals
        },
        creditCards: {
          totalCards: cards.length,
          totalCreditLimit,
          totalCurrentBalance,
          totalAvailableCredit: totalCreditLimit - totalCurrentBalance,
          overallUtilization: parseFloat(overallUtilization.toFixed(2))
        },
        monthlyTrend,
        topCategories: Object.entries(categoryTotals)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({ category, amount }))
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard analytics' });
  }
});

// Get monthly expense report
router.get('/monthly/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('cardId', 'cardName cardNumber color').sort({ date: -1 });

    // Group by category
    const categoryAnalysis = {};
    expenses.forEach(expense => {
      if (!categoryAnalysis[expense.category]) {
        categoryAnalysis[expense.category] = {
          total: 0,
          count: 0,
          expenses: []
        };
      }
      categoryAnalysis[expense.category].total += expense.amount;
      categoryAnalysis[expense.category].count += 1;
      categoryAnalysis[expense.category].expenses.push(expense);
    });

    // Group by card
    const cardAnalysis = {};
    expenses.forEach(expense => {
      const cardId = expense.cardId._id.toString();
      if (!cardAnalysis[cardId]) {
        cardAnalysis[cardId] = {
          cardName: expense.cardId.cardName,
          color: expense.cardId.color,
          total: 0,
          count: 0
        };
      }
      cardAnalysis[cardId].total += expense.amount;
      cardAnalysis[cardId].count += 1;
    });

    // Daily spending pattern
    const dailySpending = {};
    expenses.forEach(expense => {
      const day = expense.date.getDate();
      if (!dailySpending[day]) {
        dailySpending[day] = 0;
      }
      dailySpending[day] += expense.amount;
    });

    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({
      message: 'Monthly report retrieved successfully',
      report: {
        period: `${year}-${month.padStart(2, '0')}`,
        totalSpending,
        totalTransactions: expenses.length,
        averageTransaction: totalSpending / expenses.length || 0,
        categoryAnalysis,
        cardAnalysis,
        dailySpending,
        expenses: expenses.slice(0, 20) // Latest 20 expenses
      }
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Server error retrieving monthly report' });
  }
});

// Get spending insights and savings suggestions
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get last 3 months of expenses
    const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
    const expenses = await Expense.find({
      userId,
      date: { $gte: threeMonthsAgo }
    });

    // Calculate average monthly spending by category
    const categoryAverages = {};
    const monthlyTotals = {};

    expenses.forEach(expense => {
      const monthKey = `${expense.date.getFullYear()}-${expense.date.getMonth()}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {};
      }
      if (!monthlyTotals[monthKey][expense.category]) {
        monthlyTotals[monthKey][expense.category] = 0;
      }
      monthlyTotals[monthKey][expense.category] += expense.amount;
    });

    // Calculate averages with iteration limit
    const monthDataEntries = Object.values(monthlyTotals).slice(0, 12); // Limit to 12 months max
    monthDataEntries.forEach(monthData => {
      const categoryEntries = Object.entries(monthData).slice(0, 20); // Limit to 20 categories max
      categoryEntries.forEach(([category, amount]) => {
        if (!categoryAverages[category]) {
          categoryAverages[category] = [];
        }
        categoryAverages[category].push(amount);
      });
    });

    // Generate insights
    const insights = [];
    const savingsSuggestions = [];

    // High spending categories
    const highSpendingCategories = Object.entries(categoryAverages)
      .map(([category, amounts]) => ({
        category,
        average: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3);

    highSpendingCategories.forEach(({ category, average }) => {
      insights.push({
        type: 'high_spending',
        title: `High ${category} Spending`,
        description: `You spend an average of $${average.toFixed(2)} per month on ${category}`,
        category,
        amount: average
      });

      // Generate savings suggestions
      if (average > 200) {
        savingsSuggestions.push({
          category,
          suggestion: `Consider setting a monthly budget of $${(average * 0.8).toFixed(2)} for ${category} to save $${(average * 0.2).toFixed(2)} per month`,
          potentialSavings: average * 0.2
        });
      }
    });

    // Credit utilization insights
    const cards = await CreditCard.find({ userId, isActive: true });
    const highUtilizationCards = cards.filter(card => {
      const utilization = (card.currentBalance / card.creditLimit) * 100;
      return utilization > 70;
    });

    highUtilizationCards.forEach(card => {
      const utilization = (card.currentBalance / card.creditLimit) * 100;
      insights.push({
        type: 'high_utilization',
        title: 'High Credit Utilization',
        description: `${card.cardName} is ${utilization.toFixed(1)}% utilized. Consider paying down the balance.`,
        cardId: card._id,
        utilization
      });
    });

    // Non-essential spending
    const nonEssentialExpenses = expenses.filter(expense => !expense.isEssential);
    const nonEssentialTotal = nonEssentialExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    if (nonEssentialTotal > 0) {
      insights.push({
        type: 'non_essential',
        title: 'Non-Essential Spending',
        description: `You've spent $${nonEssentialTotal.toFixed(2)} on non-essential items in the last 3 months`,
        amount: nonEssentialTotal
      });

      savingsSuggestions.push({
        category: 'Non-Essential',
        suggestion: `Reducing non-essential spending by 30% could save you $${(nonEssentialTotal * 0.3).toFixed(2)} over 3 months`,
        potentialSavings: nonEssentialTotal * 0.3
      });
    }

    res.json({
      message: 'Spending insights retrieved successfully',
      insights,
      savingsSuggestions,
      summary: {
        totalExpensesAnalyzed: expenses.length,
        analysisPeriod: '3 months',
        topSpendingCategory: highSpendingCategories[0]?.category || 'N/A'
      }
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ message: 'Server error retrieving insights' });
  }
});

// Get category-wise spending comparison
router.get('/categories/comparison', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate }
    });

    // Group by month and category
    const monthlyData = {};
    expenses.forEach(expense => {
      const monthKey = expense.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }
      if (!monthlyData[monthKey][expense.category]) {
        monthlyData[monthKey][expense.category] = 0;
      }
      monthlyData[monthKey][expense.category] += expense.amount;
    });

    // Get all unique categories
    const allCategories = [...new Set(expenses.map(expense => expense.category))];

    res.json({
      message: 'Category comparison retrieved successfully',
      data: {
        monthlyData,
        categories: allCategories,
        period: `${months} months`
      }
    });
  } catch (error) {
    console.error('Category comparison error:', error);
    res.status(500).json({ message: 'Server error retrieving category comparison' });
  }
});

module.exports = router;

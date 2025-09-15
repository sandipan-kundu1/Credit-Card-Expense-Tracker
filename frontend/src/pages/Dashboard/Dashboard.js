import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  IconButton,
} from '@mui/material';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Add,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { analyticsAPI, expensesAPI } from '../../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, expensesRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        expensesAPI.getRecentExpenses(5)
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setRecentExpenses(expensesRes.data.expenses);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 30) return 'success';
    if (utilization < 70) return 'warning';
    return 'error';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          },
        },
      },
    },
  };

  const chartData = analytics ? {
    labels: analytics.monthlyTrend.map(item => item.month),
    datasets: [
      {
        data: analytics.monthlyTrend.map(item => item.amount),
        borderColor: 'rgb(25, 118, 210)',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/expenses')}
        >
          Add Expense
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="stats-grid">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(analytics?.currentMonth?.totalSpending || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {analytics?.currentMonth?.expenseCount || 0} transactions
                  </Typography>
                </Box>
                <Receipt color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Credit Cards
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics?.creditCards?.totalCards || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active cards
                  </Typography>
                </Box>
                <CreditCard color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Available Credit
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {formatCurrency(analytics?.creditCards?.totalAvailableCredit || 0)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total limit: {formatCurrency(analytics?.creditCards?.totalCreditLimit || 0)}
                  </Typography>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Utilization
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics?.creditCards?.overallUtilization?.toFixed(1) || 0}%
                  </Typography>
                  <Chip
                    label={
                      analytics?.creditCards?.overallUtilization < 30
                        ? 'Good'
                        : analytics?.creditCards?.overallUtilization < 70
                        ? 'Fair'
                        : 'High'
                    }
                    color={getUtilizationColor(analytics?.creditCards?.overallUtilization || 0)}
                    size="small"
                  />
                </Box>
                {analytics?.creditCards?.overallUtilization < 50 ? (
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <TrendingDown color="error" sx={{ fontSize: 40 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Spending Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Spending Trend
                </Typography>
                <IconButton onClick={() => navigate('/analytics')}>
                  <ArrowForward />
                </IconButton>
              </Box>
              <Box height={300}>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Top Categories
                </Typography>
                <IconButton onClick={() => navigate('/analytics')}>
                  <ArrowForward />
                </IconButton>
              </Box>
              <List dense>
                {analytics?.topCategories?.slice(0, 5).map((category, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={category.category}
                      secondary={formatCurrency(category.amount)}
                    />
                  </ListItem>
                ))}
                {(!analytics?.topCategories || analytics.topCategories.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary="No expenses yet"
                      secondary="Start adding expenses to see categories"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Expenses
                </Typography>
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/expenses')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentExpenses.map((expense) => (
                  <ListItem key={expense._id} divider>
                    <ListItemIcon>
                      <Receipt />
                    </ListItemIcon>
                    <ListItemText
                      primary={expense.description}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {expense.category} • {expense.cardId?.cardName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(expense.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(expense.amount)}
                    </Typography>
                  </ListItem>
                ))}
                {recentExpenses.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No recent expenses"
                      secondary="Start tracking your expenses to see them here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Category,
  CreditCard,
  MonetizationOn,
} from '@mui/icons-material';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { toast } from 'react-toastify';
import { analyticsAPI } from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [insights, setInsights] = useState(null);
  const [categoryComparison, setCategoryComparison] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedMonth, selectedYear]);

  const fetchAnalyticsData = async () => {
    try {
      const [monthlyRes, insightsRes, comparisonRes] = await Promise.all([
        analyticsAPI.getMonthlyReport(selectedYear, selectedMonth),
        analyticsAPI.getInsights(),
        analyticsAPI.getCategoryComparison(6)
      ]);

      setMonthlyReport(monthlyRes.data.report);
      setInsights(insightsRes.data);
      setCategoryComparison(comparisonRes.data.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Category breakdown chart data
  const categoryChartData = monthlyReport ? {
    labels: Object.keys(monthlyReport.categoryAnalysis),
    datasets: [{
      data: Object.values(monthlyReport.categoryAnalysis).map(cat => cat.total),
      backgroundColor: Object.keys(monthlyReport.categoryAnalysis).map(() => getRandomColor()),
      borderWidth: 2,
    }]
  } : null;

  // Card usage chart data
  const cardChartData = monthlyReport ? {
    labels: Object.values(monthlyReport.cardAnalysis).map(card => card.cardName),
    datasets: [{
      label: 'Spending by Card',
      data: Object.values(monthlyReport.cardAnalysis).map(card => card.total),
      backgroundColor: 'rgba(25, 118, 210, 0.6)',
      borderColor: 'rgba(25, 118, 210, 1)',
      borderWidth: 2,
    }]
  } : null;

  // Monthly trend data
  const monthlyTrendData = categoryComparison ? {
    labels: Object.keys(categoryComparison.monthlyData),
    datasets: categoryComparison.categories.slice(0, 5).map((category, index) => ({
      label: category,
      data: Object.keys(categoryComparison.monthlyData).map(month => 
        categoryComparison.monthlyData[month][category] || 0
      ),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      fill: false,
      tension: 0.4,
    }))
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Analytics & Insights
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Monthly Report" />
          <Tab label="Spending Insights" />
          <Tab label="Trends" />
        </Tabs>
      </Paper>

      {/* Month/Year Selector */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Month"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(2023, i).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <MenuItem key={2020 + i} value={2020 + i}>
                  {2020 + i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Monthly Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Summary - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {formatCurrency(monthlyReport?.totalSpending)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Spending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="secondary" fontWeight="bold">
                        {monthlyReport?.totalTransactions || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Transactions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {formatCurrency(monthlyReport?.averageTransaction)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Transaction
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {Object.keys(monthlyReport?.categoryAnalysis || {}).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Categories Used
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Spending by Category
                </Typography>
                <Box height={300}>
                  {categoryChartData && (
                    <Doughnut data={categoryChartData} options={chartOptions} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card Usage */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Spending by Card
                </Typography>
                <Box height={300}>
                  {cardChartData && (
                    <Bar data={cardChartData} options={barChartOptions} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Breakdown
                </Typography>
                <List>
                  {monthlyReport && Object.entries(monthlyReport.categoryAnalysis).map(([category, data]) => (
                    <ListItem key={category} divider>
                      <ListItemIcon>
                        <Category />
                      </ListItemIcon>
                      <ListItemText
                        primary={category}
                        secondary={`${data.count} transactions`}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(data.total)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Spending Insights */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Spending Insights
                </Typography>
                <List>
                  {insights?.insights?.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {insight.type === 'high_spending' && <TrendingUp color="warning" />}
                        {insight.type === 'high_utilization' && <CreditCard color="error" />}
                        {insight.type === 'non_essential' && <MonetizationOn color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={insight.title}
                        secondary={insight.description}
                      />
                    </ListItem>
                  ))}
                  {(!insights?.insights || insights.insights.length === 0) && (
                    <ListItem>
                      <ListItemText
                        primary="No insights available"
                        secondary="Add more expenses to get personalized insights"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Savings Suggestions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 Savings Suggestions
                </Typography>
                {insights?.savingsSuggestions?.map((suggestion, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {suggestion.category}
                    </Typography>
                    <Typography variant="body2">
                      {suggestion.suggestion}
                    </Typography>
                    <Chip
                      label={`Potential savings: ${formatCurrency(suggestion.potentialSavings)}`}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Alert>
                ))}
                {(!insights?.savingsSuggestions || insights.savingsSuggestions.length === 0) && (
                  <Alert severity="info">
                    Keep tracking your expenses to get personalized savings suggestions!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Monthly Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  6-Month Category Trends
                </Typography>
                <Box height={400}>
                  {monthlyTrendData && (
                    <Line data={monthlyTrendData} options={chartOptions} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Trend Analysis */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trend Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  This chart shows your spending patterns across different categories over the last 6 months.
                  Look for trends to identify areas where you might be able to reduce spending.
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Increasing Trends"
                      secondary="Categories where your spending has been growing"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingDown color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Decreasing Trends"
                      secondary="Categories where you've successfully reduced spending"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;

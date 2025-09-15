import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  Add,
  Receipt,
  MoreVert,
  Edit,
  Delete,
  FilterList,
  Search,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { expensesAPI, cardsAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const expenseCategories = [
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

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuExpenseId, setMenuExpenseId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalExpenses: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    cardId: '',
    startDate: null,
    endDate: null
  });
  const [formData, setFormData] = useState({
    cardId: '',
    amount: '',
    description: '',
    category: 'Other',
    subcategory: '',
    merchant: '',
    location: '',
    date: new Date(),
    tags: '',
    notes: '',
    isEssential: false
  });

  useEffect(() => {
    fetchExpenses();
    fetchCards();
  }, [pagination.currentPage, filters]);

  const fetchExpenses = async () => {
    try {
      const params = {
        page: pagination.currentPage,
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      if (filters.category) params.category = filters.category;
      if (filters.cardId) params.cardId = filters.cardId;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();

      const response = await expensesAPI.getExpenses(params);
      setExpenses(response.data.expenses);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Fetch expenses error:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await cardsAPI.getCards();
      setCards(response.data.cards);
    } catch (error) {
      console.error('Fetch cards error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        date: formData.date.toISOString()
      };

      if (editingExpense) {
        const response = await expensesAPI.updateExpense(editingExpense._id, expenseData);
        setExpenses(expenses.map(expense => 
          expense._id === editingExpense._id ? response.data.expense : expense
        ));
        toast.success('Expense updated successfully!');
      } else {
        const response = await expensesAPI.addExpense(expenseData);
        setExpenses([response.data.expense, ...expenses.slice(0, 9)]);
        toast.success('Expense added successfully!');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Submit expense error:', error);
      toast.error(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      cardId: expense.cardId._id,
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      subcategory: expense.subcategory || '',
      merchant: expense.merchant || '',
      location: expense.location || '',
      date: new Date(expense.date),
      tags: expense.tags.join(', '),
      notes: expense.notes || '',
      isEssential: expense.isEssential
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesAPI.deleteExpense(expenseId);
        setExpenses(expenses.filter(expense => expense._id !== expenseId));
        toast.success('Expense deleted successfully!');
      } catch (error) {
        console.error('Delete expense error:', error);
        toast.error('Failed to delete expense');
      }
    }
    handleMenuClose();
  };

  const resetForm = () => {
    setFormData({
      cardId: '',
      amount: '',
      description: '',
      category: 'Other',
      subcategory: '',
      merchant: '',
      location: '',
      date: new Date(),
      tags: '',
      notes: '',
      isEssential: false
    });
    setEditingExpense(null);
  };

  const handleMenuClick = (event, expenseId) => {
    setAnchorEl(event.currentTarget);
    setMenuExpenseId(expenseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuExpenseId(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      cardId: '',
      startDate: null,
      endDate: null
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category) => {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Expenses
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Expense
          </Button>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {expenseCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Card</InputLabel>
                  <Select
                    value={filters.cardId}
                    onChange={(e) => handleFilterChange('cardId', e.target.value)}
                    label="Card"
                  >
                    <MenuItem value="">All Cards</MenuItem>
                    {cards.map((card) => (
                      <MenuItem key={card._id} value={card._id}>
                        {card.cardName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button onClick={clearFilters} startIcon={<FilterList />}>
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardContent>
            <List>
              {expenses.map((expense) => (
                <ListItem
                  key={expense._id}
                  divider
                  secondaryAction={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(expense.amount)}
                      </Typography>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, expense._id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {expense.description}
                        </Typography>
                        <Chip
                          label={expense.category}
                          size="small"
                          color={getCategoryColor(expense.category)}
                        />
                        {expense.isEssential && (
                          <Chip label="Essential" size="small" color="success" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {expense.cardId?.cardName} • {new Date(expense.date).toLocaleDateString()}
                        </Typography>
                        {expense.merchant && (
                          <Typography variant="body2" color="textSecondary">
                            {expense.merchant}
                            {expense.location && ` • ${expense.location}`}
                          </Typography>
                        )}
                        {expense.tags.length > 0 && (
                          <Box mt={1}>
                            {expense.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {expenses.length === 0 && (
              <Box textAlign="center" py={8}>
                <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Expenses Found
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                  Start tracking your expenses by adding your first transaction
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setDialogOpen(true)}
                >
                  Add Your First Expense
                </Button>
              </Box>
            )}

            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={(e, page) => setPagination({ ...pagination, currentPage: page })}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Expense Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItemComponent 
            onClick={() => handleEdit(expenses.find(e => e._id === menuExpenseId))}
          >
            <Edit sx={{ mr: 1 }} />
            Edit Expense
          </MenuItemComponent>
          <MenuItemComponent onClick={() => handleDelete(menuExpenseId)}>
            <Delete sx={{ mr: 1 }} />
            Delete Expense
          </MenuItemComponent>
        </Menu>

        {/* Add/Edit Expense Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Credit Card</InputLabel>
                    <Select
                      value={formData.cardId}
                      onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                      label="Credit Card"
                    >
                      {cards.map((card) => (
                        <MenuItem key={card._id} value={card._id}>
                          {card.cardName} (Available: {formatCurrency(card.availableCredit)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    inputProps={{ min: 0.01, step: 0.01 }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      label="Category"
                    >
                      {expenseCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Merchant"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="food, restaurant, dinner"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Essential Expense</InputLabel>
                    <Select
                      value={formData.isEssential}
                      onChange={(e) => setFormData({ ...formData, isEssential: e.target.value })}
                      label="Essential Expense"
                    >
                      <MenuItem value={false}>No</MenuItem>
                      <MenuItem value={true}>Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {editingExpense ? 'Update' : 'Add'} Expense
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Expenses;

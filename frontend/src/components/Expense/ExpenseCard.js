import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Receipt,
  LocationOn,
  Store,
} from '@mui/icons-material';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  return (
    <Card className="expense-card" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Receipt color="action" />
              <Typography variant="h6" fontWeight="bold">
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

            <Typography variant="body2" color="textSecondary" gutterBottom>
              {expense.cardId?.cardName} • {new Date(expense.date).toLocaleDateString()}
            </Typography>

            {expense.merchant && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Store fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {expense.merchant}
                </Typography>
              </Box>
            )}

            {expense.location && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="textSecondary">
                  {expense.location}
                </Typography>
              </Box>
            )}

            {expense.tags && expense.tags.length > 0 && (
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

            {expense.notes && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                "{expense.notes}"
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold" color="primary" className="expense-amount">
              {formatCurrency(expense.amount)}
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onEdit(expense); handleMenuClose(); }}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
          <MenuItem onClick={() => { onDelete(expense._id); handleMenuClose(); }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;

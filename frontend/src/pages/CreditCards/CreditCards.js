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
  Fab,
  CircularProgress,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Add,
  CreditCard as CreditCardIcon,
  MoreVert,
  Edit,
  Delete,
  Payment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { cardsAPI } from '../../utils/api';

const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover', 'Other'];
const cardColors = [
  '#1976d2', '#dc004e', '#7b1fa2', '#388e3c', '#f57c00',
  '#5d4037', '#616161', '#0097a7', '#303f9f', '#c62828'
];

const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCardId, setMenuCardId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardType: 'Visa',
    expiryMonth: '',
    expiryYear: '',
    creditLimit: '',
    currentBalance: '',
    interestRate: '18.5',
    color: '#1976d2'
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      console.log('Fetching cards...');
      const response = await cardsAPI.getCards();
      console.log('Cards response:', response.data);
      setCards(response.data.cards || []);
    } catch (error) {
      console.error('Fetch cards error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load credit cards');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (cardId) => {
    const card = cards.find(c => c._id === cardId);
    setSelectedCard(card);
    setFormData({
      cardName: card.cardName,
      cardNumber: card.cardNumber,
      cardType: card.cardType,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      creditLimit: card.creditLimit,
      currentBalance: card.currentBalance,
      interestRate: card.interestRate,
      color: card.color
    });
    setIsEditing(true);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await cardsAPI.updateCard(selectedCard._id, formData);
        setCards(cards.map(card => 
          card._id === selectedCard._id ? response.data.card : card
        ));
        setEditDialogOpen(false);
        toast.success('Credit card updated successfully!');
      } else {
        const response = await cardsAPI.addCard(formData);
        setCards([...cards, response.data.card]);
        setDialogOpen(false);
        toast.success('Credit card added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Card operation error:', error);
      toast.error(error.response?.data?.message || 'Failed to save credit card');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await cardsAPI.makePayment(selectedCard._id, parseFloat(paymentAmount));
      
      // Update the card in the list
      setCards(cards.map(card => 
        card._id === selectedCard._id ? response.data.card : card
      ));
      
      setPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedCard(null);
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to deactivate this card?')) {
      try {
        await cardsAPI.deleteCard(cardId);
        setCards(cards.filter(card => card._id !== cardId));
        toast.success('Credit card deactivated successfully!');
      } catch (error) {
        console.error('Delete card error:', error);
        toast.error('Failed to deactivate credit card');
      }
    }
    handleMenuClose();
  };

  const resetForm = () => {
    setFormData({
      cardName: '',
      cardNumber: '',
      cardType: 'Visa',
      expiryMonth: '',
      expiryYear: '',
      creditLimit: '',
      currentBalance: '',
      interestRate: '18.5',
      color: '#1976d2'
    });
    setIsEditing(false);
    setSelectedCard(null);
  };

  const handleMenuClick = (event, cardId) => {
    setAnchorEl(event.currentTarget);
    setMenuCardId(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCardId(null);
  };

  const formatCardNumber = (number) => {
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 30) return 'success';
    if (utilization < 70) return 'warning';
    return 'error';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Credit Cards
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Card
        </Button>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => {
          const utilization = (card.currentBalance / card.creditLimit) * 100;
          return (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                  color: 'white',
                  position: 'relative'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {card.cardName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, card._id)}
                      sx={{ color: 'white' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h5" fontFamily="monospace" mb={2}>
                    {formatCardNumber(card.cardNumber)}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Expires
                      </Typography>
                      <Typography variant="body1">
                        {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {card.cardType}
                      </Typography>
                      <CreditCardIcon />
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        Balance: {formatCurrency(card.currentBalance)}
                      </Typography>
                      <Typography variant="body2">
                        {utilization.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(utilization, 100)}
                      color={getUtilizationColor(utilization)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                      }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      Available: {formatCurrency(card.availableCredit)}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ 
                        color: 'white', 
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': { borderColor: 'white' }
                      }}
                      onClick={() => {
                        setSelectedCard(card);
                        setPaymentDialogOpen(true);
                      }}
                    >
                      Make Payment
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {cards.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CreditCardIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Credit Cards Added
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                  Add your first credit card to start tracking expenses
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setDialogOpen(true)}
                >
                  Add Your First Card
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Card Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemComponent onClick={() => handleEditCard(menuCardId)}>
          <Edit sx={{ mr: 1 }} />
          Edit Card
        </MenuItemComponent>
        <MenuItemComponent onClick={() => handleDeleteCard(menuCardId)}>
          <Delete sx={{ mr: 1 }} />
          Deactivate Card
        </MenuItemComponent>
      </Menu>

      {/* Edit Card Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Credit Card</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Name"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Limit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  inputProps={{ min: 100 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Card Color
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {cardColors.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
                      }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update Card</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Credit Card</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Name"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number (16 digits)"
                  value={formData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setFormData({ ...formData, cardNumber: value });
                  }}
                  placeholder="1234567890123456"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Card Type"
                  value={formData.cardType}
                  onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                >
                  {cardTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Month"
                  type="number"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                  inputProps={{ min: 1, max: 12 }}
                  required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                  inputProps={{ min: new Date().getFullYear() }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Limit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  inputProps={{ min: 100 }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Balance"
                  type="number"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  inputProps={{ min: 0 }}
                  helperText="Enter existing balance on this card"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Card Color
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {cardColors.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
                      }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Card</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <form onSubmit={handlePayment}>
          <DialogContent>
            {selectedCard && (
              <Box mb={2}>
                <Typography variant="h6">{selectedCard.cardName}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Current Balance: {formatCurrency(selectedCard.currentBalance)}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              inputProps={{ 
                min: 0.01, 
                max: selectedCard?.currentBalance,
                step: 0.01 
              }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Process Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CreditCards;

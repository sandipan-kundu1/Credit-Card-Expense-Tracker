import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';

const CreditCardComponent = ({ card, onClick, selected = false }) => {
  const utilization = (card.currentBalance / card.creditLimit) * 100;

  const formatCardNumber = (number) => {
    return number.replace(/(.{4})/g, '$1 ').trim();
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

  return (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
        color: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        } : {},
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}
      />
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {card.cardName}
          </Typography>
          <CreditCardIcon />
        </Box>

        <Typography variant="h5" fontFamily="monospace" mb={2} letterSpacing={2}>
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
            <Chip
              label={`${utilization.toFixed(1)}% used`}
              size="small"
              color={getUtilizationColor(utilization)}
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">
              Balance: {formatCurrency(card.currentBalance)}
            </Typography>
            <Typography variant="body2">
              Limit: {formatCurrency(card.creditLimit)}
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
      </CardContent>
    </Card>
  );
};

export default CreditCardComponent;

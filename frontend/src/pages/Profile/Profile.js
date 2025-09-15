import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    monthlyBudget: user?.monthlyBudget || 0,
    currency: user?.currency || 'USD',
    preferences: {
      theme: user?.preferences?.theme || 'light',
      notifications: {
        email: user?.preferences?.notifications?.email || true,
        push: user?.preferences?.notifications?.push || true,
      },
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      if (grandchild) {
        setProfileData({
          ...profileData,
          [parent]: {
            ...profileData[parent],
            [child]: {
              ...profileData[parent][child],
              [grandchild]: value,
            },
          },
        });
      } else {
        setProfileData({
          ...profileData,
          [parent]: {
            ...profileData[parent],
            [child]: value,
          },
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [field]: value,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: profileData.currency,
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Personal Information
                </Typography>
                <Button
                  variant={editing ? "contained" : "outlined"}
                  startIcon={editing ? <Save /> : <Edit />}
                  onClick={editing ? handleProfileUpdate : () => setEditing(true)}
                  disabled={loading}
                >
                  {editing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Budget"
                    type="number"
                    value={profileData.monthlyBudget}
                    onChange={(e) => handleInputChange('monthlyBudget', parseFloat(e.target.value) || 0)}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editing}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={profileData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      label="Currency"
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                      <MenuItem value="AUD">AUD - Australian Dollar</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {editing && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        monthlyBudget: user?.monthlyBudget || 0,
                        currency: user?.currency || 'USD',
                        preferences: {
                          theme: user?.preferences?.theme || 'light',
                          notifications: {
                            email: user?.preferences?.notifications?.email || true,
                            push: user?.preferences?.notifications?.push || true,
                          },
                        },
                      });
                    }}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
                src={user?.avatar}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box textAlign="left">
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Monthly Budget
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {formatCurrency(profileData.monthlyBudget)}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Email Verified
                </Typography>
                <Typography variant="body2" color={user?.isEmailVerified ? 'success.main' : 'error.main'}>
                  {user?.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Preferences
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={profileData.preferences.theme}
                  onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
                  label="Theme"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Notifications
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={profileData.preferences.notifications.email}
                    onChange={(e) => handleInputChange('preferences.notifications.email', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={profileData.preferences.notifications.push}
                    onChange={(e) => handleInputChange('preferences.notifications.push', e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Security
              </Typography>

              {user?.googleId ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You signed in with Google. Password management is handled by Google.
                </Alert>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                  fullWidth
                >
                  Change Password
                </Button>
              )}

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Last login: {new Date().toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" disabled={loading}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;

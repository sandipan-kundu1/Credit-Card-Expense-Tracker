const crypto = require('crypto');

// Simple CSRF protection using double-submit cookie pattern
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Skip CSRF for login and register routes
  if (req.path === '/login' || req.path === '/register') {
    return next();
  }

  // Skip CSRF for requests with valid JWT tokens (already authenticated)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { csrfProtection, generateCSRFToken };
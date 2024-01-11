const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

// Handle POST request for login
router.post('/', (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication
  if (email === 'user@example.com' && password === 'password') {
    // Generate JWT token upon successful login
    const accessToken = jwt.sign({ email }, secretKey, { expiresIn: '15m' });

    // Generate and store refresh token
    const refreshToken = generateRefreshToken();
    refreshTokens[email] = refreshToken;

    // Set access token as a regular cookie
    res.cookie('accessToken', accessToken, { maxAge: 900000, httpOnly: true });

    // Set refresh token as an HttpOnly and secure cookie
    res.cookie('refreshToken', refreshToken, { maxAge: 3600000, httpOnly: true, secure: true, sameSite: 'Strict' });

    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Function to generate the refresh token
function generateRefreshToken() {
  const refreshKey = crypto.randomBytes(32).toString('hex');
  return jwt.sign({}, refreshKey, { expiresIn: '3h' });
}

module.exports = router;

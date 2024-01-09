const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Endpoint for refreshing the access token
router.post('/refresh-token', (req, res) => {
  const { email, refreshToken } = req.body;

  // Validate the refresh token
  if (!isValidRefreshToken(email, refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token'});
  }

  // If the refresh token is valid, issue a new access token
  const accessToken = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
  res.json({ accessToken });
});

// Function to validate the refresh token
function isValidRefreshToken(email, refreshToken) {
    // Check if the stored token matches the provided token
    return refreshToken[email] === refreshToken;
}

module.exports = router;

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const validator = require('./validator')
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

// Endpoint for refreshing the access token
router.post('/', (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }
  
  const { email, refreshToken } = req.body;

  // Validate the refresh token
  if (!isValidRefreshToken(email, refreshToken)) {
    return res.status(401).send({ error: 'Invalid refresh token'});
  }

  // If the refresh token is valid, issue a new access token
  const accessToken = jwt.sign({ email }, secretKey, { expiresIn: '15m' });
  res.send({ accessToken });
});

// Function to validate the refresh token
function isValidRefreshToken(email, providedRefreshToken) {
    // Check if the stored token matches the provided token
    return refreshTokens[email] === providedRefreshToken;
}

module.exports = router;

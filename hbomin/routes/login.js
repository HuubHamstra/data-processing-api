const express = require('express');
const router = express.Router();
const query = require('../query');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

// Handle POST request for login
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const dbQuery = `CALL get_login_data('${email}')`;
  let login_data = await query.outputJSON(dbQuery, res);
  received_password = login_data[0][0].password;

  verifyPassword(password, received_password).then(is_match => {
    if (is_match) {
      // Generate JWT token upon successful login
      const accessToken = jwt.sign({ email }, secretKey, { expiresIn: '15m' });

      // Generate and store refresh token
      const refreshToken = generateRefreshToken();
      refreshTokens[email] = refreshToken;
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  })
  .catch(() => {
    res.status(401).json({ message: 'Invalid username or password' });
  });
});

// Function to generate the refresh token
function generateRefreshToken() {
  const refreshKey = crypto.randomBytes(32).toString('hex');
  return jwt.sign({}, refreshKey, { expiresIn: '3h' });
};

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = router;

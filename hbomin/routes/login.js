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

  try {
    let login_data = await query.outputJSON(dbQuery, res);

    if (login_data && login_data[0] && login_data[0][0]) {
      const received_password = login_data[0][0].password;
      console.log(received_password);
      verifyPassword(password, received_password).then((is_match) => {
        console.log(is_match);
        if (is_match) {
          // Generate JWT token upon successful login
          const accessToken = jwt.sign({ email }, secretKey, {
            expiresIn: '15m',
          });

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
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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

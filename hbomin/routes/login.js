const express = require('express');
const router = express.Router();
const query = require('../query');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const validator = require('./validator')
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { email, password } = req.body;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL get_login_data('${email}')`;

  try {
    let login_data = await query.run(dbQuery, !xmlResponse, res);

    if (login_data && login_data[0] && login_data[0][0]) {
      const received_password = login_data[0][0].password;
      verifyPassword(password, received_password).then((is_match) => {
        if (is_match) {
          // Generate JWT token upon successful login
          const accessToken = jwt.sign({ email }, secretKey, {
            expiresIn: '15m',
          });

          // Generate and store refresh token
          const refreshToken = generateRefreshToken();
          refreshTokens[email] = refreshToken;
          res.send({ accessToken, refreshToken });
        } else {
          res.status(401).send({ error: 'Invalid username or password' });
        }
      })
      .catch(() => {
        res.status(401).send({ error: 'Invalid username or password' });
      });
    } else {
      res.status(401).send({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
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
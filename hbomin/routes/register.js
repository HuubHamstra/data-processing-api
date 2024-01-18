const express = require('express');
const router = express.Router();
const query = require('../query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

router.post('/', async (req, res) => {
  const body = req.body;
  const accept = body["accept"];
  const xmlResponse = accept?.includes('application/xml') || null;
  const full_name = body["fullname"];
  const email = body["email"];
  const password = body["password"];
  const split = splitFullName(full_name);
  const first_name = split["firstName"];
  const last_name = split["lastName"];

  try {
    hashPassword(password).then(async hashed_password => {
      const dbQuery = `CALL create_account('${first_name}', '${last_name}', '${email}','${hashed_password}', 0, 0, 'profile name', 'profile image', 18, 0, 0, 0, 0);`;
      let login_data = await query.run(dbQuery, !xmlResponse, res);

      if (login_data && login_data instanceof Object && login_data.constructor.name === 'OkPacket') {
        // Generate JWT token upon successful login
        const accessToken = jwt.sign({ email }, secretKey, {
          expiresIn: '15m',
        });

        // Generate and store refresh token
        const refreshToken = generateRefreshToken();
        refreshTokens[email] = refreshToken;
        res.send({ accessToken, refreshToken });
      }
    })
      .catch(err => {
        console.error('Error hashing password:', err);
        res.status(500).send({ message: 'Internal Server Error' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

function generateRefreshToken() {
  const refreshKey = crypto.randomBytes(32).toString('hex');
  return jwt.sign({}, refreshKey, { expiresIn: '3h' });
};

function splitFullName(fullName) {
  const nameArray = fullName.split(/\s+/);
  const firstName = nameArray[0];
  const lastName = nameArray.slice(1).join(' ');
  return { firstName, lastName };
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
};

module.exports = router;
const express = require('express');
const router = express.Router();
const query = require('../query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mail = require('../mail-transporter');
const validator = require('./validator')
const { secretKey, refreshTokens } = require('./config'); // Import shared configurations

router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const requiredFields = ['fullname', 'email', 'password'];

  if (!requiredFields.every(field => req.body[field])) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  const body = req.body;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  if (xmlResponse) {
    res.setHeader('content-type', 'application/xml');
  };
  const full_name = body["fullname"];
  const email = body["email"];
  const password = body["password"];
  const split = splitFullName(full_name);
  const first_name = split["firstName"];
  const last_name = split["lastName"];
  const paymentMethod = body["paymentMethod"] || 0;
  const subscription = body["subscription"] || 0;
  const profileName = body["profileName"] || "Mijn Profiel";
  const profileImage = body["profileImage"] || "";
  const profileAge = body["profileAge"] || 0;
  const language = body["language"] || 0;
  const viewMovies = body["viewMovies"] || 1;
  const viewSeries = body["viewSeries"] || 1;
  const minAge = body["viewSeries"] || profileAge;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.match(emailRegex)) {
    return res.status(400).send({ error: 'Invalid email format' });
  }

  try {
    hashPassword(password).then(async hashed_password => {
      const dbQuery = `CALL create_account('${first_name}', '${last_name}', '${email}','${hashed_password}', ${paymentMethod}, ${subscription}, '${profileName}', '${profileImage}', ${profileAge}, ${language}, ${viewMovies}, ${viewSeries}, ${minAge});`;
      let login_data = await query.run(dbQuery, !xmlResponse, res);

      if (login_data && login_data instanceof Object && login_data.constructor.name === 'OkPacket') {
        // Generate JWT token upon successful login
        const accessToken = jwt.sign({ email }, secretKey, {
          expiresIn: '15m',
        });

        // Generate and store refresh token
        const refreshToken = generateRefreshToken();
        refreshTokens[email] = refreshToken;

        // Send validation email
        const url = req.protocol + '://' + req.get('host');

        const mailOptions = {
          from: 'hbomin.api@gmail.com',
          to: email,
          subject: `Valideer uw E-Mail adres voor HBO-Min`,
          text: `Validatie E-Mail URL: ${url}/account/verify-email?token=${accessToken}`
        };

        mail.transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            res.status(500).send({ error: 'Internal Server Error' });
          }
          else {
            res.status(201).send({ accessToken, refreshToken });
          }
        });
      }
    })
      .catch(err => {
        res.status(500).send({ error: 'Internal Server Error' });
      });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
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
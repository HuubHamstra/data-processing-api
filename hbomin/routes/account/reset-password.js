const express = require('express');
const router = express.Router();
const mail = require('../../mail-transporter');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { secretKey, refreshTokens } = require('../config'); // Import shared configurations
const query = require('../../query');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('../validator');

async function authenticateToken(token) {
  if (token == null) {
    return 401;
  }

  const verifyAsync = promisify(jwt.verify);

  try {
    const user = await verifyAsync(token, secretKey);
    return user;
  }
  catch (err) {
    return 403;
  }
}

function generatePassword(length = 12) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
};

function generateRefreshToken() {
  const refreshKey = crypto.randomBytes(32).toString('hex');
  return jwt.sign({}, refreshKey, { expiresIn: '3h' });
};

router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  var { email, password } = req.body;

  if (!validator.emailValidation(res, email)) {
    return;
  }

  let isGenerated = false;
  if (!password) {
    isGenerated = true;
    password = generatePassword(16);
  };

  try {
    hashPassword(password).then(async hashed_password => {
      // Send reset email
      const accessToken = jwt.sign({ email }, secretKey, {
        expiresIn: '15m',
      });
      const refreshToken = generateRefreshToken();
      refreshTokens[email] = refreshToken;
      const url = req.protocol + '://' + req.get('host');
      var content = `Wachtwoord Reset URL: ${url}/account/reset-password?token=${accessToken}&pass=${hashed_password}`;
      content += isGenerated ? `\nOmdat er geen wachtwoord opgegeven is word het nieuwe wachtwoord: ${password}` : "";
      content += "\nAls u deze request niet heeft gedaan kunt u deze email negeren.";

      const mailOptions = {
        from: 'hbomin.api@gmail.com',
        to: email,
        subject: `Reset uw wachtwoord voor HBO-Min`,
        text: content
      };

      mail.transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.status(500).send({ error: 'Internal Server Error' });
        }
        else {
          res.status(200).send({ accessToken, refreshToken });
        }
      });
    })
      .catch(err => {
        res.status(500).send({ error: 'Internal Server Error' });
      });
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  const token = req.query.token;
  const newPassword = req.query.pass;

  await authenticateToken(token).then(async user => {
    if (typeof user === 'number') {
      switch (user) {
        case 401:
          res.status(401).send({ error: 'Unauthorized, token is missing' });
          break;
        case 403:
          res.status(403).send({ error: 'Forbidden, token is invalid' });
          break;
      }
    }
    else {
      const email = user["email"];
      const dbQuery = `CALL update_login_data('${email}', '${newPassword}');`;

      try {
        if (await query.run(dbQuery, true, res)) {
          res.sendStatus(200);
        } else {
          res.status(400).send({ error: 'Invalid data, password could not be updated' });
        }
      } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  });
});

module.exports = router;

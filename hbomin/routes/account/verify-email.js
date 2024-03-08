const express = require('express');
const router = express.Router();
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config'); // Import shared configurations
const query = require('../../query');
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

router.get('/', async (req, res) => {
  const token = req.query.token;

  try {
    await authenticateToken(token).then(user => {
      if (typeof user === 'number') {
        switch (user) {
          case 401:
            res.status(401).send({ error: 'Unauthorized, token is missing' });
            break;
          case 403:
            res.status(403).send({ error: 'Forbidden, token is invalid' });
            break;
          default:
            res.status(500).send({ error: 'Internal Server Error' });
            break;
        }
      }
      else {
        const email = user["email"];

        if (!validator.emailValidation(res, email)) {
          return;
        }

        try {
          const dbQuery = `CALL validate_email('${email}')`
          query.run(dbQuery, true, res);
        }
        catch {
                    res.status(500).send({ error: 'Internal Server Error' });
        }
        res.status(200).send({ result: email + " is geverifieerd." });
      }
    });
  }
  catch {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
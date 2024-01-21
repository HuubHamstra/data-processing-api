const express = require('express');
const router = express.Router();
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config'); // Import shared configurations
const query = require('../../query');

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
    console.error(err);
    return 403;
  }
}

router.get('/', async (req, res) => {
  const token = req.query.token;

  try {
    await authenticateToken(token).then(user => {
      if (typeof user === 'number') {
        res.sendStatus(user);
      }
      else {
        const email = user["email"];
        try {
          const dbQuery = `CALL validate_email('${email}')`
          query.run(dbQuery, true, res);
        }
        catch {
          console.error(error);
          res.status(500).send({ message: 'Internal Server Error' });
        }
        res.status(200).send(email + " is geverifieerd.");
      }
    });
  }
  catch {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
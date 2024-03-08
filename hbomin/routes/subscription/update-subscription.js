const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { accountId, subscriptionId } = req.body;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL change_subscription(${accountId}, ${subscriptionId});`;

  try {
    if (await query.run(dbQuery, !xmlResponse, res)) {
      res.sendStatus(200);
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

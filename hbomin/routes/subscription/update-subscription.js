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

  if (!validator.dataValidation(res, accountId, 'number') || !validator.unsignedValidation(res, accountId)) {
    return;
  }
  if (!validator.dataValidation(res, subscriptionId, 'number') || !validator.unsignedValidation(res, subscriptionId)) {
    return;
  }
  
  const dbQuery = `CALL change_subscription(${accountId}, ${subscriptionId});`;

  try {
    const result = await query.run(dbQuery, !xmlResponse);

    if (result) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(result);
      }
      else {
        res.status(200).send({ message: 'Subscription updated' });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, no subscription found with this id' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

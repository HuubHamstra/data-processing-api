var express = require('express');
var router = express.Router();
var query = require('../../query');
const authenticateToken = require('../authenticateToken');
const validator = require('../validator');

router.get('/', authenticateToken, async (req, res) => {
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL get_total_income()`;

  try {
    const results = await query.run(dbQuery, !xmlResponse);

    if (xmlResponse) {
      res.setHeader('content-type', 'application/xml');
      res.send(results);
    }
    else {
      const totalIncome = results[0][0]["total_subscription_income"];
      if (validator.isNumber(totalIncome)) {
        res.send({ totalIncome });
      }
      else {
        res.status(500).send({ error: 'Invalid or missing total income value' });
      }
    }
  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

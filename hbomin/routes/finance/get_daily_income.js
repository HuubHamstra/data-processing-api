var express = require('express');
var router = express.Router();
var query = require('../../query');
const authenticateToken = require('../authenticateToken');
const validator = require('../validator');

router.get('/', authenticateToken, async (req, res) => {
  const date = req.query.date?.split("T")?.shift();
  const dbQuery = `CALL get_daily_income('${date}')`;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  try {
    const results = await query.run(dbQuery, !xmlResponse);

    if (xmlResponse) {
      res.setHeader('content-type', 'application/xml');
      res.send(results);
    }
    else {
      const dailyIncome = results[0][0]["SUM(subscription.subscription_price)"];
      if (validator.isNumber(dailyIncome)) {
        res.send({ dailyIncome });
      } else {
        res.status(500).send({ error: 'Invalid or missing daily income value' });
      }
    }


  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

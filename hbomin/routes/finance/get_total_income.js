var express = require('express');
var router = express.Router();
var query = require('../../query');
const authenticateToken = require('../authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    const acceptHeader = req.get('accept');
    const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
    const dbQuery = `CALL get_total_income()`;
  
    try {
      const results = await query.run(dbQuery, !xmlResponse);

      // Assuming the value you want is in results[0][0]["total_subscription_income"]
      const totalIncome = results[0][0]["total_subscription_income"];

      if (typeof totalIncome === 'number') {
        res.send({ totalIncome: totalIncome });
      } else {
        res.status(500).send({ error: 'Invalid or missing total income value' });
      }
    } catch (error) {
            res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;

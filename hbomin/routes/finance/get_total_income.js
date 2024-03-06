var express = require('express');
var router = express.Router();
var query = require('../../query');
const validator = require('../validator')
const authenticateToken = require('../authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    const { accept } = req.body;
    const xmlResponse = accept?.includes('application/xml') || null;
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
      console.error('Fout bij het uitvoeren van de query: ', error);
      res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;

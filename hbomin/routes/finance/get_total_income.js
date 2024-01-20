var express = require('express');
var router = express.Router();
var query = require('../../query');

router.get('/', async (req, res) => {
    const dbQuery = `CALL get_total_income()`;
    const { accept } = req.body;
    const xmlResponse = accept?.includes('application/xml') || null;
  
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

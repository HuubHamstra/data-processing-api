var express = require('express');
var router = express.Router();
var query = require('../../query');

router.get('/', async (req, res) => {
    const dbQuery = `CALL get_total_income()`;
  
    try {
      const results = await query.outputJSON(dbQuery);
      res.json({ results: results });
    } catch (error) {
      console.error('Fout bij het uitvoeren van de query: ', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

module.exports = router;
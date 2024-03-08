const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle GET request for login
router.get('/', async (req, res) => {
  const dbQuery = `SELECT * FROM watchlist_view`;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  try {
    const results = await query.run(dbQuery, !xmlResponse);
    res.send({ results: results });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).send({ error: 'An error occurred' });
  }
});


module.exports = router;

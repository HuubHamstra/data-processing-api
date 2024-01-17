const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const dbQuery = `SELECT * FROM genre`;

  try {
    const results = await query.outputJSON(dbQuery);
    res.json({ results: results });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;

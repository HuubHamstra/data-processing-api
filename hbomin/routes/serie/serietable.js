const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const dbQuery = `SELECT series.name, series.description, genre.title as genre_title FROM series JOIN genre on series.genre_id = genre.genre_id;`;

  try {
    const results = await query.outputJSON(dbQuery);
    res.json({ results: results });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;

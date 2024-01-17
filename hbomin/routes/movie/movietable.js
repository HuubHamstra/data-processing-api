const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const dbQuery = `SELECT movie.title, movie.description, genre.title as genre_title FROM movie JOIN genre on movie.genre_id = genre.genre_id;`;

  try {
    const results = await query.outputJSON(dbQuery);
    res.json({ results: results[0] });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;

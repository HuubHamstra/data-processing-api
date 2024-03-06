const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

router.get('/', async (req, res) => {
  const { accept } = req.body;
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `SELECT series.name, series.description, genre.title as genre_title FROM series JOIN genre on series.genre_id = genre.genre_id;`;

  try {
    const results = await query.run(dbQuery, !xmlResponse);
    res.send({ results: results });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

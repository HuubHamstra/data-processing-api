const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `SELECT movie.title, movie.description, genre.title as genre_title FROM movie JOIN genre on movie.genre_id = genre.genre_id;`;

  try {
    const results = await query.run(dbQuery, !xmlResponse, res);
    if (xmlResponse) {
      res.setHeader('content-type', 'application/xml');
      res.status(200).send(results);
    }
    else {
      res.status(200).send({ results: results });
    }
  } catch (error) {
        res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

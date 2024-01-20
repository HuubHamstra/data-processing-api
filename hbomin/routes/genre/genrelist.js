const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const dbQuery = `SELECT * FROM genre`;
  const { accept } = req.body;
  const xmlResponse = accept?.includes('application/xml') || null;

  try {
    const results = await query.run(dbQuery, !xmlResponse, res);
    res.send({ results: results });
  } catch (error) {
    console.error('Fout bij het uitvoeren van de query: ', error);
    res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

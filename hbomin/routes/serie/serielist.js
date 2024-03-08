const express = require('express');
const router = express.Router();
const query = require('../../query');

router.get('/', async (req, res) => {
  const dbQuery = `SELECT * FROM series`;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  if (xmlResponse) {
    res.setHeader('content-type', 'application/xml');
  };

  try {
    const results = await query.run(dbQuery, !xmlResponse);
    res.send({ results: results });
  } catch (error) {
        res.status(500).send({ error: 'An error occurred' });
  }
});

module.exports = router;

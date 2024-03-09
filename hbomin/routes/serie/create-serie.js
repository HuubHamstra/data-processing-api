const express = require('express');
const router = express.Router();
const validator = require('../validator');
const query = require('../../query');

// Handle POST request for creating a series
router.post('/', async (req, res) => {
  const { name, description, genreId } = req.body;

  if (!name || !description || !genreId) {
    return res.status(400).send({ error: 'Missing required fields in request body' });
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  if (!validator.dataValidation(res, name, 'string') || !validator.dataValidation(res, description, 'string') || !validator.dataValidation(res, genreId, 'number')) {
    return;
  }
  if (!validator.unsignedValidation(res, genreId)) {
    return;
  }
  
  const dbQuery = `INSERT INTO \`series\` (\`series_id\`, \`name\`, \`description\`, \`genre_id\`) VALUES (NULL, '${name}', '${description}', '${genreId}');`;

  try {
    let series = await query.run(dbQuery, !xmlResponse, res);

    if (series) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(201).send(series);
      } else {
        res.status(201).send({ series });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, series could not be created' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

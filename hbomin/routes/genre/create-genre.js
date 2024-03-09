const express = require('express');
const router = express.Router();
const validator = require('../validator');
const query = require('../../query');

// Handle POST request for creating a genre
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send({ error: 'Missing required fields in request body' });
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  if (!validator.dataValidation(res, title, 'string') || !validator.dataValidation(res, description, 'string')) {
    return;
  }
  
  const dbQuery = `INSERT INTO \`genre\` (\`genre_id\`, \`title\`, \`description\`) VALUES (NULL, '${title}', '${description}');`;

  try {
    let genre = await query.run(dbQuery, !xmlResponse, res);

    if (genre) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(202).send(genre);
      } else {
        res.status(202).send({ genre });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, genre could not be created' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

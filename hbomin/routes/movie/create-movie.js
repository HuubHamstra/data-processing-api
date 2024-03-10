const express = require('express');
const router = express.Router();
const validator = require('../validator');
const query = require('../../query');
const authenticateToken = require('../authenticateToken');

// Handle POST request for creating a movie
router.post('/', authenticateToken, async (req, res) => {

  if (!req.body.title || !req.body.duration || !req.body.description || !req.body.definitionTypeId || !req.body.genreId) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  if (!validator.bodyValidation(req, res)) {
    return;
  }

  var { title, duration, description, definitionTypeId, genreId } = req.body;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  if (!validator.dataValidation(res, title, 'string') || !validator.dataValidation(res, duration, 'number') || !validator.dataValidation(res, description, 'string') || !validator.dataValidation(res, definitionTypeId, 'number') || !validator.dataValidation(res, genreId, 'number')) {
    return;
  }
  if (!validator.unsignedValidation(res, duration) || !validator.unsignedValidation(res, definitionTypeId) || !validator.unsignedValidation(res, genreId)) {
    return;
  }

  const dbQuery = `INSERT INTO \`movie\` (\`movie_id\`, \`title\`, \`duration\`, \`description\`, \`definition_type_id\`, \`genre_id\`) VALUES (NULL, '${title}', '${duration}', '${description}', '${definitionTypeId}', '${genreId}');`;

  try {
    let movie = await query.run(dbQuery, !xmlResponse, res);

    if (movie) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(201).send(movie);
      }
      else {
        res.status(201).send({ movie });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, movie could not be created' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

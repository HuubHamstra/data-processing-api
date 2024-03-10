const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');
const authenticateToken = require('../authenticateToken');

// Handle POST request for updating a genre
router.post('/', authenticateToken, async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { genreId, title, description } = req.body;

  if (!validator.dataValidation(res, genreId, 'number')) {
    return;
  }

  let update_title = typeof title !== 'undefined';
  let update_description = typeof description !== 'undefined';

  if (update_title && !validator.dataValidation(res, title, 'string')) {
    return;
  }

  if (update_description && !validator.dataValidation(res, description, 'string')) {
    return;
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  let updateQuery = 'UPDATE `genre` SET';
  let updates = [];

  if (update_title) {
    updates.push(` title = '${title}'`);
  }

  if (update_description) {
    updates.push(` description = '${description}'`);
  }

  updateQuery += updates.join(',');
  updateQuery += ` WHERE genre_id = ${genreId};`;

  try {
    let genre = await query.run(updateQuery, !xmlResponse, res);

    if (genre) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(genre);
      }
      else {
        res.status(200).send({ genre: "Genre successfully updated" });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, genre could not be updated' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

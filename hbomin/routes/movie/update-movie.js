const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');
const authenticateToken = require('./authenticateToken');

// Handle POST request for updating a movie
router.post('/', authenticateToken, async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { movieId, title, duration, description, definitionTypeId, genreId } = req.body;

  if (!validator.dataValidation(res, movieId, 'number')) {
    return;
  }

  let update_title = typeof title !== 'undefined';
  let update_duration = typeof duration !== 'undefined';
  let update_description = typeof description !== 'undefined';
  let update_definition_type_id = typeof definitionTypeId !== 'undefined';
  let update_genre_id = typeof genreId !== 'undefined';

  if (update_title && !validator.dataValidation(res, title, 'string')) {
    return;
  }

  if (update_duration && (!validator.dataValidation(res, duration, 'number') || !validator.unsignedValidation(res, duration))) {
    return;
  }

  if (update_description && !validator.dataValidation(res, description, 'string')) {
    return;
  }

  if (update_definition_type_id && (!validator.dataValidation(res, definitionTypeId, 'number') || !validator.unsignedValidation(res, definitionTypeId))) {
    return;
  }

  if (update_genre_id && (!validator.dataValidation(res, genreId, 'number') || !validator.unsignedValidation(res, genreId))) {
    return;
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  let updateQuery = 'UPDATE `movie` SET';
  let updates = [];

  if (update_title) {
    updates.push(` title = '${title}'`);
  }

  if (update_duration) {
    updates.push(` duration = ${duration}`);
  }

  if (update_description) {
    updates.push(` description = '${description}'`);
  }

  if (update_definition_type_id) {
    updates.push(` definition_type_id = ${definitionTypeId}`);
  }

  if (update_genre_id) {
    updates.push(` genre_id = ${genreId}`);
  }

  updateQuery += updates.join(',');
  updateQuery += ` WHERE movie_id = ${movieId};`;

  try {
    let movie = await query.run(updateQuery, !xmlResponse, res);

    if (movie) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(movie);
      }
      else {
        res.status(200).send({ movie: "Movie successfully updated" });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, movie could not be updated' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

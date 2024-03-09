const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');

// Handle POST request for updating a series
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { seriesId, name, description, genreId } = req.body;

  if (!validator.dataValidation(res, seriesId, 'number')) {
    return;
  }

  let update_name = typeof name !== 'undefined';
  let update_description = typeof description !== 'undefined';
  let update_genre_id = typeof genreId !== 'undefined';

  if (update_name && !validator.dataValidation(res, name, 'string')) {
    return;
  }

  if (update_description && !validator.dataValidation(res, description, 'string')) {
    return;
  }

  if (update_genre_id && (!validator.dataValidation(res, genreId, 'number') || !validator.unsignedValidation(res, genreId))) {
    return;
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  let updateQuery = 'UPDATE `series` SET';
  let updates = [];

  if (update_name) {
    updates.push(` name = '${name}'`);
  }

  if (update_description) {
    updates.push(` description = '${description}'`);
  }

  if (update_genre_id) {
    updates.push(` genre_id = ${genreId}`);
  }

  updateQuery += updates.join(',');
  updateQuery += ` WHERE series_id = ${seriesId};`;

  try {
    let series = await query.run(updateQuery, !xmlResponse, res);

    if (series) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(series);
      }
      else
      {
        res.status(200).send({ series: "Series successfully updated" });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, series could not be updated' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');
const e = require('express');

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { profileId, progressId, movieId, episodeId, unixTime } = req.body;
  const isEpisode = typeof movieId === 'undefined';

  if (isEpisode && (!validator.dataValidation(res, episodeId, 'number') || !validator.unsignedValidation(res, episodeId))) {
    return;
  }
  if (!isEpisode && (!validator.dataValidation(res, movieId, 'number') || !validator.unsignedValidation(res, movieId))) {
    return;
  }
  if (!validator.dataValidation(res, progressId, 'number') || !validator.unsignedValidation(res, progressId)) {
    return;
  }
  if (!validator.dataValidation(res, profileId, 'number') || !validator.unsignedValidation(res, profileId)) {
    return;
  }
  if (!validator.dataValidation(res, unixTime, 'number') || !validator.unsignedValidation(res, unixTime)) {
    return;
  }

  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL update_progress(${profileId}, ${isEpisode}, ${progressId}, ${movieId}, ${episodeId}, FROM_UNIXTIME(${unixTime} / 1000));`;

  try {
    const result = await query.run(dbQuery, !xmlResponse);

    if (result) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(result);
      }
      else {
        res.status(200).send({ message: 'Progress updated' });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, no progress found with this id' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
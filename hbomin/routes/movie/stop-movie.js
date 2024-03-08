const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { profileId, progressId, movieId, episodeId, unixTime } = req.body;
  const isEpisode = typeof movieId === 'undefined';
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  if (xmlResponse) {
    res.setHeader('content-type', 'application/xml');
  };
  const dbQuery = `CALL update_progress(${profileId}, ${isEpisode}, ${progressId}, ${movieId}, ${episodeId}, FROM_UNIXTIME(${unixTime} / 1000));`;

  try {
    if (await query.run(dbQuery, !xmlResponse, res)) {
      res.sendStatus(200);
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
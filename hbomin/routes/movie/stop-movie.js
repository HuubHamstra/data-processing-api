const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
  const { profileId, progressId, movieId, episodeId, unixTime, accept } = req.body;
  const isEpisode = typeof movieId === 'undefined';
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `CALL update_progress(${profileId}, ${isEpisode}, ${progressId}, ${movieId}, ${episodeId}, FROM_UNIXTIME(${unixTime} / 1000));`;

  try {
    if (await query.run(dbQuery, !xmlResponse, res)) {
      res.sendStatus(200);
    } else {
      res.status(400).send({ message: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
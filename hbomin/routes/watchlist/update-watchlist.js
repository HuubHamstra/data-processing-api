const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { profileId, isEpisode, watchId, shouldRemove, accept } = req.body;
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `CALL ${shouldRemove ? "remove_from_watchlist" : "add_to_watchlist"}(${profileId}, ${isEpisode}, ${watchId});`;

  try {
    if (await query.run(dbQuery, !xmlResponse, res)) {
      res.sendStatus(200);
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

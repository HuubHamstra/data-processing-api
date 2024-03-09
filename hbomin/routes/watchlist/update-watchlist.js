const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { profileId, isEpisode, watchId, shouldRemove } = req.body;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

  if (!validator.dataValidation(res, profileId, 'number') || !validator.unsignedValidation(res, profileId)) {
    return;
  }
  if (!validator.dataValidation(res, isEpisode, 'number') || !validator.rangeValidation(res, isEpisode, 0, 1)) {
    return;
  }
  if (!validator.dataValidation(res, watchId, 'number') || !validator.unsignedValidation(res, watchId)) {
    return;
  }
  if (!validator.dataValidation(res, shouldRemove, 'boolean')) {
    return;
  }

  const dbQuery = `CALL ${shouldRemove ? "remove_from_watchlist" : "add_to_watchlist"}(${profileId}, ${isEpisode}, ${watchId});`;

  try {
    const result = await query.run(dbQuery, !xmlResponse);

    if (result) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(200).send(result);
      }
      else {
        res.status(200).send({ message: 'Watchlist updated' });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, no watchlist found with this id' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

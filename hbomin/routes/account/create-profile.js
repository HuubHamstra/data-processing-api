const express = require('express');
const router = express.Router();
const validator = require('../validator');
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
  
  if (!req.body.profileName || !req.body.age) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  if (!validator.bodyValidation(req, res)) {
    return;
  }

  var { accountId, profileName, profileImage, age, language, viewMovies, viewSeries, minAge } = req.body;
  language = language ?? 0;
  viewMovies = viewMovies ?? 1;
  viewSeries = viewSeries ?? 1;
  minAge = minAge ?? age;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL create_profile(${accountId}, '${profileName}', '${profileImage}', ${age}, ${language}, ${viewMovies}, ${viewSeries}, ${minAge});`;

  try {
    let profile = await query.run(dbQuery, !xmlResponse, res);

    if (profile) {
      res.status(202).send({ profile });
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

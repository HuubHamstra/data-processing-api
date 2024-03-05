const express = require('express');
const router = express.Router();
const validator = require('../validator')
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  var { accountId, profileName, profileImage, age, language, viewMovies, viewSeries, minAge, accept } = req.body;
  language = language ?? 0;
  viewMovies = viewMovies ?? 1;
  viewSeries = viewSeries ?? 1;
  minAge = minAge ?? age;
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `CALL create_profile(${accountId}, '${profileName}', '${profileImage}', ${age}, ${language}, ${viewMovies}, ${viewSeries}, ${minAge});`;

  try {
    let profile = await query.run(dbQuery, !xmlResponse, res);

    if (profile) {
      res.status(202).send({ profile });
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
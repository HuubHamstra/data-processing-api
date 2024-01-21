const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
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
      res.status(200).send({ profile });
    } else {
      res.status(400).send({ message: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
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

  if (!validator.dataValidation(res, accountId, 'number') || !validator.dataValidation(res, profileName, 'string') || !validator.dataValidation(res, profileImage, 'string') || !validator.dataValidation(res, age, 'number') || !validator.dataValidation(res, language, 'number') || !validator.dataValidation(res, viewMovies, 'number') || !validator.dataValidation(res, viewSeries, 'number') || !validator.dataValidation(res, minAge, 'number')) {
    return;
  }
  if (!validator.unsignedValidation(res, age) || !validator.unsignedValidation(res, language) || !validator.rangeValidation(res, viewMovies, 0, 1) || !validator.rangeValidation(res, viewSeries, 0, 1) || !validator.unsignedValidation(res, minAge)) {
    return;
  }

  const dbQuery = `CALL create_profile(${accountId}, '${profileName}', '${profileImage}', ${age}, ${language}, ${viewMovies}, ${viewSeries}, ${minAge});`;

  try {
    let profile = await query.run(dbQuery, !xmlResponse, res);

    if (profile) {
      if (xmlResponse) {
        res.setHeader('content-type', 'application/xml');
        res.status(201).send(profile);
      }
      else {
        res.status(201).send({ profile });
      }
    } else {
      res.status(400).send({ error: 'Invalid data, profile could not be created' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator')

// Handle POST request for login
router.post('/', async (req, res) => {
  if (!validator.bodyValidation(req, res)) {
    return;
  }

  const { accountId, profileName, profileImage, age } = req.body;
  let update_name = typeof profileName !== 'undefined';
  let update_image = typeof profileImage !== 'undefined';
  let update_age = typeof age !== 'undefined';
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL update_profile(${accountId}, '${profileName}', '${profileImage}', ${age}, ${update_name}, ${update_image}, ${update_age});`;

  try {
    let profile = await query.run(dbQuery, !xmlResponse, res);

    if (profile) {
      res.status(200).send({ profile: "Profile successfully updated" });
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
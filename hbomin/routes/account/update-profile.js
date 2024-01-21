const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
  const { accountId, profileName, profileImage, age, accept } = req.body;
  let update_name = typeof profileName !== 'undefined';
  let update_image = typeof profileImage !== 'undefined';
  let update_age = typeof age !== 'undefined';
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `CALL update_profile(${accountId}, '${profileName}', '${profileImage}', ${age}, ${update_name}, ${update_image}, ${update_age});`;

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
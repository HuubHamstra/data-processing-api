const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle POST request for login
router.post('/', async (req, res) => {
  const { profileId, accept } = req.body;
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `SELECT * FROM watchlist_view WHERE profile_id = ${profileId};`;

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

const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle GET request for login
router.get('/', async (req, res) => {
  var { email, accept } = req.body;
  const xmlResponse = accept?.includes('application/xml') || null;
  const dbQuery = `CALL get_full_name('${email}');`;

  try {
    let name = await query.run(dbQuery, !xmlResponse, res);

    if (name) {
      res.status(200).send({ name });
    } else {
      res.status(400).send({ message: 'Invalid data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
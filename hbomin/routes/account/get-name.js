const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');

// Handle GET request for login
router.get('/', async (req, res) => {
  const { email } = req.query;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  if (xmlResponse) {
    res.setHeader('content-type', 'application/xml');
  };
  const dbQuery = `CALL get_full_name('${email}');`;

  try {
    const result = await query.run(dbQuery, !xmlResponse);
    
    if (result && result[0] && result[0][0]) {
      const { first_name, last_name } = result[0][0];
      res.status(200).send({ first_name, last_name });
    } else {
      res.status(400).send({ error: 'Invalid data' });
    }
  } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

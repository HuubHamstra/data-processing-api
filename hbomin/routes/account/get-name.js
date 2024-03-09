const express = require('express');
const router = express.Router();
const query = require('../../query');
const validator = require('../validator');

// Handle GET request for login
router.get('/', async (req, res) => {
  const { email } = req.query;
  const acceptHeader = req.get('accept');
  const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
  const dbQuery = `CALL get_full_name('${email}');`;

  if (!validator.emailValidation(res, email)) {
    return;
  }

  try {
    const result = await query.run(dbQuery, !xmlResponse);

    if (xmlResponse) {
      res.set('Content-Type', 'application/xml');
      res.status(200).send(result);
    } else {
      if (result && result[0] && result[0][0]) {
        const { first_name, last_name } = result[0][0];
        res.status(200).json({ first_name, last_name });
      } else {
        res.status(400).json({ error: 'Invalid data, no account found with this email' });
      }
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

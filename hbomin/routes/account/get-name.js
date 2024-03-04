const express = require('express');
const router = express.Router();
const query = require('../../query');

// Handle GET request for login
router.get('/', async (req, res) => {
  const { email, accept } = req.query; // Use req.query for GET requests
  const xmlResponse = accept?.includes('application/xml') || null;
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
    console.error('Error in GET /account/get-name:', error); // Log the error
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;

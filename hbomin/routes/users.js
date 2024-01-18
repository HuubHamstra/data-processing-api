const express = require('express');
const router = express.Router();
const query = require('../query');

router.get('/', async (req, res) => {
    const { accept } = req.body;
    const xmlResponse = accept?.includes('application/xml') || null;
    const dbQuery = `SELECT account_id AS id, first_name AS firstname, last_name AS lastname, email, email_validated, payment_method AS subscription FROM account`;

    try {
        const results = await query.run(dbQuery, !xmlResponse, res);
        res.send({ results: results });
    } catch (error) {
        console.error('Fout bij het uitvoeren van de query: ', error);
        res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const query = require('../query');
const validator = require('./validator')
const authenticateToken = require('./authenticateToken');

router.get('/', authenticateToken , async (req, res) => {
    const acceptHeader = req.get('accept');
    const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');
    const dbQuery = `SELECT account_id AS id, first_name AS firstname, last_name AS lastname, email, email_validated, payment_method AS subscription FROM account`;

    try {
        const results = await query.run(dbQuery, !xmlResponse, res);
        res.send({ results: results });
    } catch (error) {
                res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;
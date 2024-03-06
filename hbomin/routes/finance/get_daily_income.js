var express = require('express');
var router = express.Router();
var query = require('../../query');
const validator = require('../validator')
const authenticateToken = require('../authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    const date = req.query.date?.split("T")?.shift();
    const dbQuery = `CALL get_daily_income('${date}')`;
    const { accept } = req.body;
    const xmlResponse = accept?.includes('application/xml') || null;

    try {
        const results = await query.run(dbQuery, !xmlResponse);

        // Extract the numeric value from the results
        const numericValue = results[0][0]["SUM(subscription.subscription_price)"];

        // Check if the numeric value is valid
        const isValidNumericValue = typeof numericValue === 'number' && !isNaN(numericValue);

        if (isValidNumericValue) {
            res.send({ dailyIncome: numericValue });
        } else {
            res.status(500).send({ error: 'Invalid or missing daily income value' });
        }
    } catch (error) {
        console.error('Fout bij het uitvoeren van de query: ', error);
        res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var query = require('../../query');
const authenticateToken = require('../authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    const date = req.query.date?.split("T")?.shift();
    const dbQuery = `CALL get_daily_income('${date}')`;
    const acceptHeader = req.get('accept');
    const xmlResponse = acceptHeader && acceptHeader.includes('application/xml');

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
                res.status(500).send({ error: 'An error occurred' });
    }
});

module.exports = router;

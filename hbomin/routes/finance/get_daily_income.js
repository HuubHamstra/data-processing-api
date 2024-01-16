var express = require('express');
var router = express.Router();
var query = require('../../query');

query.outputJSON("CALL get_daily_income(NOW())", router);

module.exports = router;
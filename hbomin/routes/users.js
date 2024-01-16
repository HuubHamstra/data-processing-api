var express = require('express');
var router = express.Router();
var query = require('../query');

query.outputJSON('CALL get_login_data("user@example.com");', router);

module.exports = router;
var express = require('express');
var router = express.Router();
var query = require('../query');

query.outputJSON('CALL get_login_data("huubhamstra@live.nl");', router);

module.exports = router;
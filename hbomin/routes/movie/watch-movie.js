var express = require('express');
var router = express.Router();
var query = require('../../query');

query.outputJSON("CALL", router)

module.exports = router;

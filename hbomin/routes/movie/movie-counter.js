var express = require('express');
var router = express.Router();
var query = require('../../query');

query.outputJSON("CALL get_movie_count()", router)

module.exports = router;

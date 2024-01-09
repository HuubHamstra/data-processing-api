var express = require('express');
var router = express.Router();
var query = require('../query');

const connection = require('../database');

query.outputJSON("CALL create_account('test','user','mail@mail.mail','test',0,0,'test','test',18,0,0,0,0)", router)

module.exports = router;

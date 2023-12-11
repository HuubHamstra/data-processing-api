var express = require('express');
var router = express.Router();

const connection = require('../database');

router.get('/', function(req, res, next) {
  test(function(results, error) {
    if (error) {
      console.error('Fout bij het uitvoeren van de query: ', error);
      res.status(500).json({ error: 'An error occurred' }); // Sending error as JSON response
    } else {
      res.json({ results:results[0] }); // Sending results as JSON response
    }
  });
});

function test(callback) {
  connection.query('CALL get_usernames', (error, results) => {
    if (error) {
      callback(null, error); // Pass error to the callback
    } else {
      callback(results, null); // Pass results to the callback
      console.log(results);
    }
  });
}

module.exports = router;
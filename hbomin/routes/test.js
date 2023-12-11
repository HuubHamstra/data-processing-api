var express = require('express');
var router = express.Router();

const connection = require('../database');

/* GET users listing. */
// connection.query('SELECT * FROM `accounts`', (error, results) => {
//     if (error) {
//       console.error('Fout bij het uitvoeren van de query: ', error);
//       return;
//     }
//     console.log('Resultaten:', results);
//   });

module.exports = router;

var connection = require('./database');
var xml = require('xml');

function runQuery(dbQuery, callback) {
  connection.query(dbQuery, (error, results) => {
    if (error) {
      callback(null, error); // Pass error to the callback
    } else {
      callback(results, null); // Pass results to the callback
    };
  });
}

function outputJSON(dbQuery, router) {
  runQuery(dbQuery, function(results, error) {
    router.get('/', function(req, res) {
      if (error) {
        console.error('Fout bij het uitvoeren van de query: ', error);
        res.status(500).json({ error: 'An error occurred' }); // Sending error as JSON response
      } else {
        res.json({ results:results[0] }); // Sending results as JSON response
      }
    });
  });
};

function outputXML(dbQuery, router) {
  runQuery(dbQuery, function(results, error) {
    router.get('/', function(req, res) {
      res.set('Content-Type', 'text/xml');
      if (error) {
        console.error('Fout bij het uitvoeren van de query: ', error);
        res.status(500).send(xml({ error: 'An error occurred' })); // Sending error as XML response
      } else {
        res.send(xml({ results:results[0] })); // Sending results as XML response
      }
    });
  });
};

module.exports = {outputXML, outputJSON};